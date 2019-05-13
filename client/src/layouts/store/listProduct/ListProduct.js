import {
  Table, Button, Dropdown, Icon,
  Badge, Menu, Pagination, Drawer, Row, Col,
  Divider, Popconfirm, message, Form, Input, InputNumber, Select, Spin, Tag,
  Modal, Steps,
} from 'antd';
import react, { Component, useState } from 'react';
import { Card } from 'antd';
import PageHeader from 'ant-design-pro/lib/PageHeader';
import { formatMessage, FormattedMessage } from 'umi/locale';
import {
  HOST, PRODUCT_URL,
  PROVIDER_URL, SHELF_URL,
  UNIT_URL, BATCH_URL, LATEST_BATCH_URL,
  LABEL_PRINT_URL, ADD_PRODUCT_URL,
  PRODUCT_NAME_URL, ALL_PRODUCT_URL,
  DELETE_BATCH_URL, DELETE_PRODUCT_URL, UPDATE_PRODUCT_URL, RESTOCK_PRODUCT_URL
} from '@/../../api';

import { DELETE_STORE } from '@/../../constant';
import Authentication from '@/utils/Authentication';
import { formatNumber } from '@/utils/utils';
import styles from './ListProduct.less';

Authentication.setUser("admin", 1);

const pStyle = {
  fontSize: 16,
  color: 'rgba(0,0,0,0.85)',
  lineHeight: '24px',
  display: 'block',
  marginBottom: 16,
};

const { Option } = Select;

const DescriptionItem = ({ title, content }) => (
  <div
    style={{
      fontSize: 14,
      lineHeight: '22px',
      marginBottom: 7,
      color: 'rgba(0,0,0,0.65)',
    }}
  >
    <p
      style={{
        marginRight: 8,
        display: 'inline-block',
        color: 'rgba(0,0,0,0.85)',
      }}
    >
      {title}:
    </p>
    {content}
  </div>
);


function BatchDrawer(product, batch_index, onClose, visible) {
  if (!product || !(product.batches)[batch_index])
    return;
  let batch = (product.batches)[batch_index];

  const columns = [
    { title: <FormattedMessage id="general.unit" />, dataIndex: 'product_unit_name', key: 'product_unit_name' },
    { title: <FormattedMessage id="general.initial_quan_per_unit" />, dataIndex: 'initial_quantity', key: 'initial_quantity' },
    { title: <FormattedMessage id="general.product.cost" />, dataIndex: 'product_cost', key: 'product_cost' },
    { title: <FormattedMessage id="general.current_quantity" />, dataIndex: 'current_quantity', key: 'current_quantity' },
    { title: <FormattedMessage id="general.product.price" />, dataIndex: 'product_price', key: 'product_price' },

  ];
  // Re-map the stock
  batch.stocks.forEach(n => {
    n.key = n.unit_layer;
    n.current_quantity = formatNumber(n.current_quantity);
    n.initial_quantity = formatNumber(n.initial_quantity);
    n.product_cost = formatNumber(n.product_cost);
    n.product_price = formatNumber(n.product_price);
  });

  return (
    <Drawer
      width={640}
      placement="right"
      closable={true}
      onClose={onClose}
      visible={visible}
    >
      <p style={{ ...pStyle, marginBottom: 24 }}><FormattedMessage id="general.batch.info" /></p>
      <p style={pStyle}><FormattedMessage id="general.product.info.basic" /></p>
      <Row>
        <Col span={24}>
          <DescriptionItem title={formatMessage({ id: 'general.product.name' })} content={product.product_name} />
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <DescriptionItem title={formatMessage({ id: 'general.batch.id' })} content={batch.batch_serial_number} />{' '}
        </Col>
        <Col span={12}>
          <DescriptionItem title={formatMessage({ id: 'general.expiry' })} content={batch.expiry} />
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <DescriptionItem title={formatMessage({ id: 'general.user_entered' })} content={batch.user_entered_username} />
        </Col>
        <Col span={12}>
          <DescriptionItem title={formatMessage({ id: 'general.entered_time' })} content={batch.entered_time} />{' '}
        </Col>
      </Row>
      <Divider />
      <p style={pStyle}><FormattedMessage id="general.stock" /></p>
      <Table
        size="small"
        columns={columns}
        dataSource={batch.stocks}
        pagination={false}
      />
    </Drawer>
  )

}

@Form.create()
class ProductDrawer extends Component {
  state = {
    onEdit: false,
    onSubmitLoading: false,
  }

  onEditChange = () => {
    let onEdit = this.state.onEdit;
    this.setState({ onEdit: !onEdit });
  }

  componentWillReceiveProps = () => {
    if (!this.props.visible)
      this.setState({ onEdit: false, onSubmitLoading: false })
  }

  onSubmit = (product) => {
    this.setState({ onSubmitLoading: true });
    const { form, onRefresh } = this.props;
    form.validateFieldsAndScroll((error, values) => {
      if (!error) {
        values.product_type = product.product_type;
        return fetch(HOST + UPDATE_PRODUCT_URL + `?user_id=${Authentication.getUserId()}&barcode=${product.barcode}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        }).then(res => res.json())
          .then(
            res => {
              if (res.result) {
                onRefresh().then(this.setState({ onSubmitLoading: false, onEdit: false }));
              } else {
                message.error("ERROR: " + res.error),
                  this.setState({ onSubmitLoading: false })
              }
            },
            err => { console.log(err); this.setState({ onSubmitLoading: false }) }
          );
      }
      return null;
    });
  }


  render() {
    const { product, onClose, visible,
      form: { getFieldDecorator, getFieldValue },
      product_providers, shelf_locations, product_units } = this.props;
    const { onEdit } = this.state;
    if (!product) return null;

    return (
      <Drawer
        width={640}
        placement="right"
        closable={true}
        onClose={onClose}
        visible={visible}
      >
        <p style={{ ...pStyle, marginBottom: 24 }}><FormattedMessage id="general.product.info" /></p>
        <Spin spinning={this.state.onSubmitLoading}>
          <div style={pStyle}><FormattedMessage id="general.product.info.basic" />
            <Divider type="vertical" />
            <span>
              <a onClick={this.onEditChange}>{onEdit ?
                <span><Icon type="delete" /><FormattedMessage id="general.cancel" /></span> : <span><Icon type="edit" /><FormattedMessage id="general.edit" /></span>}</a>

              {onEdit ? <span><Divider type="vertical" /><a onClick={() => this.onSubmit(product)}><Icon type="right-square" /><FormattedMessage id="general.submit" /></a></span> : null}
            </span>
          </div>
          <Form hideRequiredMark layout="inline">
            <Row>
              <Col span={24}>
                <DescriptionItem title={formatMessage({ id: 'general.product.name' })}
                  content={onEdit ?
                    <Form.Item>
                      {getFieldDecorator('product_name', {
                        initialValue: product.product_name,
                        rules: [{
                          required: true,
                          message: formatMessage({ id: 'validation.field.required' }),
                        }],
                      })(<Input style={{ width: 400 }} />)}
                    </Form.Item> : product.product_name} />
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <DescriptionItem title={formatMessage({ id: 'general.product.barcode' })} content={onEdit ?
                  <Form.Item>
                    {getFieldDecorator('barcode', {
                      initialValue: product.barcode,
                      rules: [{
                        required: true,
                        message: formatMessage({ id: 'validation.field.required' }),
                      }],
                    })(<InputNumber style={{ width: '100%' }} />)}
                  </Form.Item> : product.barcode} />
              </Col>
              <Col span={12}>
                <DescriptionItem title={formatMessage({ id: 'general.product.provider' })} content={onEdit ?
                  <Form.Item>
                    {getFieldDecorator('product_provider', {
                      initialValue: product.product_provider,
                      rules: [{
                        required: true,
                        message: formatMessage({ id: 'validation.field.required' }),
                      }],
                    })(<Select
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    >
                      {product_providers.map(provider =>
                        <Option key={provider.id} value={provider.id}>{provider.name}</Option>)}
                    </Select>
                    )}
                  </Form.Item> : product.product_provider_name} />
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <DescriptionItem title={formatMessage({ id: 'general.product.location' })} content={onEdit ?
                  <Form.Item>
                    {getFieldDecorator('product_location', {
                      initialValue: product.product_location,
                      rules: [{
                        required: true,
                        message: formatMessage({ id: 'validation.field.required' }),
                      }],
                    })(<Select
                      showSearch
                      optionFilterProp="children"
                      filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                    >
                      {shelf_locations.map(s =>
                        <Option key={s.id} value={s.id}>{s.shelf_name}</Option>)}
                    </Select>
                    )}
                  </Form.Item> : product.product_location_name} />
              </Col>
              <Col span={12}>
                <DescriptionItem title={formatMessage({ id: 'general.entered_date' })} content={product.entered_time} />
              </Col>
            </Row>
            <Row>
              <Col span={12}>
                <DescriptionItem title={formatMessage({ id: 'general.expiry' })} content={product.earliest_expiry} />
              </Col>
              <Col span={12}>
                <DescriptionItem title={formatMessage({ id: 'general.product.lastupdate' })} content={product.last_update} />
              </Col>
            </Row>
            <Row>
              <Col span={24}>
                <DescriptionItem
                  title={formatMessage({ id: 'general.product.use' })}
                  content={onEdit ?
                    <Form.Item>
                      {getFieldDecorator('product_use', {
                        initialValue: product.product_use,
                      })(
                        <Input.TextArea
                          style={{ minHeight: 32, width: 350 }}
                          rows={4}
                        />
                      )}</Form.Item> : product.product_use}
                />
              </Col>
            </Row>
          </Form>
        </Spin>
        <Divider />
        <p style={pStyle}>Company</p>
        <Row>
          <Col span={12}>
            <DescriptionItem title="Position" content="Programmer" />
          </Col>
          <Col span={12}>
            <DescriptionItem title="Responsibilities" content="Coding" />
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <DescriptionItem title="Department" content="AFX" />
          </Col>
          <Col span={12}>
            <DescriptionItem title="Supervisor" content={<a>Lin</a>} />
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <DescriptionItem
              title="Skills"
              content="C / C + +, data structures, software engineering, operating systems, computer networks, databases, compiler theory, computer architecture, Microcomputer Principle and Interface Technology, Computer English, Java, ASP, etc."
            />
          </Col>
        </Row>
        <Divider />
        <p style={pStyle}>Contacts</p>
        <Row>
          <Col span={12}>
            <DescriptionItem title="Email" content="AntDesign@example.com" />
          </Col>
          <Col span={12}>
            <DescriptionItem title="Phone Number" content="+86 181 0000 0000" />
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <DescriptionItem
              title="Github"
              content={(
                <a href="http://github.com/ant-design/ant-design/">
                  github.com/ant-design/ant-design/
                      </a>
              )}
            />
          </Col>
        </Row>

      </Drawer>
    )
  }
}


const productColumns = (showDrawer, showModal) =>
  [{
    title: <FormattedMessage id="general.product.name" />,
    dataIndex: 'product_name',
  }, {
    title: <FormattedMessage id="general.status" />,
    dataIndex: 'status',
    key: 'status',
    render: (text, record, index) => (
      <span className="table-operation">
        {record.inStock ? <Badge status="success" text={formatMessage({ id: 'general.product.inStock' })} /> :
          <Badge status="error" text={formatMessage({ id: 'general.product.outStock' })} />}
      </span>
    ),
  }, {
    title: <FormattedMessage id="general.product.provider" />,
    dataIndex: 'product_provider_name',
  }, {
    title: <FormattedMessage id="general.restock_progress" />,
    dataIndex: 'restock_progress',
    key: 'restock_progress',
    render: (text, product, index) => (
      <a onClick={() => showModal(product.restock_progress, product.barcode)} href="javascript:;" >
        {product.restock_progress.length % 2 != 0 ?
          <Tag color="volcano" key={product.barcode}><FormattedMessage id="general.waiting" /></Tag> : 
          (product.restock_progress.length == 2 ? 
          <Badge offset={[-5, 0]} dot status={product.restock_progress[1].action === 'confirm' ? "success" : "warning"}>
          <Tag color="grey" key={product.barcode}><FormattedMessage id="general.noaction" /></Tag>
          </Badge> : 
          <Tag color="grey" key={product.barcode}><FormattedMessage id="general.noaction" /></Tag>
          )}
      </a>
    ),
  }, {
    title: <FormattedMessage id="general.product.earliest_expiry" />,
    dataIndex: 'earliest_expiry',
  },
  {
    title: <FormattedMessage id="general.product.lastupdate" />,
    dataIndex: 'last_update',
  }, {
    title: <FormattedMessage id="general.action" />,
    dataIndex: 'operation',
    key: 'operation',
    render: (text, record, index) => (
      <span className="table-operation">
        <a href="javascript:;" onClick={() => showDrawer(index)}><FormattedMessage id="general.detail" /></a>
      </span>
    ),
  },
  ];

const Step = Steps.Step;

const steps = [{
  title: 'First',
  content: 'First-content',
}, {
  title: 'Second',
  content: 'Second-content',
}, {
  title: 'Last',
  content: 'Last-content',
}];

class RestockProgress extends Component {
  constructor(props){
    super(props);
    this.state = {
        currentStep: 0,
        loading: false,
        closed: false,
    }
  }

  componentWillReceiveProps(next){
    if (!this.props.visible || this.props.product_barcode != next.product_barcode){
      this.displayProgress(next.restock_progress);
    }
    if (next.visible){
      this.setState({closed: false})
    }    
  }

  updateProgress = (barcode, action) => {
    this.setState({loading: true});
    
    return fetch(HOST + RESTOCK_PRODUCT_URL + 
      `?product_barcode=${barcode}&action=${action}&user_id=${Authentication.getUserId()}`, {
        method: 'POST'
      })
      .then(res => res.json())
      .then(
        res => {
          if (res.result){
            setTimeout(() => {
              if (action == 'insert') this.setState({currentStep : 1, loading: false});
              else if (action == 'confirm') this.setState({currentStep : 2, loading: false});
              else this.setState({currentStep : 0, loading: false}) ;             
              this.props.onRefresh()
            }, 1000)
          }
          else {
            setTimeout(() => {
              this.setState({loading: false})
            }, 1000)
          }
        },
      err => {
        this.setState({loading: false})
      }
      )
  }

  next() {
    const currentStep = this.state.currentStep;
    if (currentStep == 0)
      this.updateProgress(this.props.product_barcode, 'insert');
    else if(currentStep == 1)
      this.updateProgress(this.props.product_barcode, 'confirm');
    else 
      this.setState({currentStep: 0})
    
  }

  cancel() {
    this.updateProgress(this.props.product_barcode, 'cancel')
  }

  displayProgress = (progress) => {
    if (progress.length % 2 !== 0)
      this.setState({currentStep:1});
    else 
      this.setState({currentStep:0});
  }

  latestProgress = (progress) => {
    if (progress.length < 2)
      return null;
    let confirm = progress[1].action === 'confirm';
    let text = ` bởi ${progress[1].user_entered_username} vào lúc ${progress[1].entered_time}`;
    let msg = confirm ? "Hoàn tất" + text : "Hủy" + text;
    return <Badge status={confirm ? "success" : "warning"} text={`Lịch sử gần đây: ${msg}`} />
  }

  render(){
    const {visible, onCancel, restock_progress} = this.props;
    const {currentStep, closed} = this.state;
    return (
      <Modal
          title={formatMessage({ 'id': 'general.restock_progress' })}
          visible={visible && !closed}
          closable={true}
          footer={this.latestProgress(restock_progress)}
          maskClosable={true}
          onCancel={onCancel}
        >
          <Steps progressDot current={currentStep}>
            <Step title={formatMessage({ 'id': 'general.noaction' })} description={formatMessage({ 'id': 'general.noaction.description' })} />
            <Step title={formatMessage({ 'id': 'general.waiting' })} description={formatMessage({ 'id': 'general.waiting.description' })} />
            <Step title={formatMessage({ 'id': 'general.confirm' })} description={formatMessage({ 'id': 'general.confirm.description' })} />
          </Steps>
          <div className={styles.stepsAction}>
            {
              currentStep < steps.length - 1
              && <Button loading={this.state.loading} type="primary" onClick={() => this.next()}><FormattedMessage id="general.confirm"/></Button>
            }
            {
              currentStep === steps.length - 1
              && <Button type="primary" onClick={() => this.setState({closed: true})}>Done</Button>
            }
            {
              currentStep == 1
              && (
                <Button style={{ marginLeft: 8 }} onClick={() => this.cancel()}>
                  <FormattedMessage id="general.cancel"/>
            </Button>
              )
            }
          </div>
      </Modal>
    )
  }
}

class ListProduct extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      loading: true,
      product_data: [],
      product_providers: [],
      shelf_locations: [],
      product_units: [],
      restock_progress: [],
      barcode: 0,
      total: 0,
      limitRecord: 20,
      page: 1,
      productDrawerVisible: false,
      batchDrawerVisible: false,
      restockProgressVisible: false,
      product_index: -1,
      batch_index: -1,
      user_id: Authentication.getUserId(),
      allowDelete: false,
      allowEdit: false,
    };
  }


  reset = () => {
    this.setState({
      selectedRowKeys: [],
      productDrawerVisible: false,
      batchDrawerVisible: false,
      product_index: -1,
      batch_index: -1,
      barcode: 0,
      restock_progress: [],
    })
  }

  showBatchDrawer = (product_index, batch_index) => {
    this.setState({
      batchDrawerVisible: true,
      batch_index: batch_index,
      product_index: product_index,
    });
  }

  showDrawer = (index) => {
    this.setState({
      productDrawerVisible: true,
      product_index: index,
    });
  };

  showModal = (progress, barcode) => {
    this.setState({
      restockProgressVisible: true,
      restock_progress: progress,
      barcode,
    });
  }

  onClose = () => {
    this.setState({
      productDrawerVisible: false,
    });
  };

  onCloseBatchDrawer = () => {
    this.setState({
      batchDrawerVisible: false,
    })
  }

  start = () => {
    this.setState({ loading: true });
    // ajax request after empty completing
    setTimeout(() => {
      this.setState({
        selectedRowKeys: [],
        loading: false,
      });
    }, 1000);
  }

  componentDidMount() {
    
    this.fetchProduct();
    Authentication.isPermitted(this.state.user_id, DELETE_STORE)
      .then(res => {
        this.setState({ allowDelete: res })
      });
    Promise.all([
      fetch(HOST + PROVIDER_URL),
      fetch(HOST + SHELF_URL),
      fetch(HOST + UNIT_URL)
    ])
      .then(([providers, shelves, units]) => Promise.all([providers.json(), shelves.json(), units.json()]))
      .then(([providers, shelves, units]) => {
        this.setState({
          product_providers: !providers.error ? providers.result : [],
          shelf_locations: !shelves.error ? shelves.result : [],
          product_units: !units.error ? units.result : [],
        });
      }).catch((err) => {
        console.log(err);
      });

  }

  fetchProduct = () => {
    //const { limitRecord, page } = this.state;
    this.setState({ loading: true });
    return fetch(HOST + ALL_PRODUCT_URL + `?limit=${this.state.limitRecord}&page=${this.state.page}`)
      .then(res => res.json())
      .then(
        res => {
          if (!res.error) {
            // Process data
            let i = 0;
            let products = res.result.products;
            products.forEach(item => {
              item.index = i++;
              item.key = item.barcode;
              item.inStock = false;
              // Check if this product is not out of stock
              for (let i = 0; i < item.batches.length; i++) {
                let batch = item.batches[i];
                let lastStock = batch.stocks.length - 1;
                if (lastStock >= 0 && (batch.stocks)[lastStock].current_quantity > 0) {
                  item.inStock = true;
                  return;
                }
              }
            });
            this.setState({ product_data: products, total: res.result.total });
          }
        },
        err => {
          console.log(err);
        }
      ).then(this.setState({ loading: false }))
  }

  onSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys });
  }

  handleDropdownVisible = (name) => {
    this.setState({ [name]: true });
  }

  onConfirmDeleteBatch = (product_barcode, batch_serial_number) => {
    this.setState({ loading: true });
    if (!product_barcode || !batch_serial_number)
      return;

    return fetch(HOST + DELETE_BATCH_URL
      + `?user_id=${this.state.user_id}&product_barcode=${product_barcode}&batch_serial_number=${batch_serial_number}`, {
        method: 'POST'
      })
      .then(res => res.json())
      .then(
        res => {
          if (res.result)
            this.fetchProduct();
          else {
            message.error("ERROR: " + res.error);
          }
        }
      ).then(
        this.setState({ loading: false })
      )
  }

  expandedRowRender = (record, index, indent, expaned) => {
    const batches = record.batches;
    const name = record.product_name;
    const product_barcode = record.barcode;
    if (!batches || !expaned)
      return null;
    const columns = [
      { title: <FormattedMessage id="general.entered_date" />, dataIndex: 'entered_time', key: 'date' },
      { title: <FormattedMessage id="general.batch_id" />, dataIndex: 'batch_serial_number', key: 'batch_serial_number' },
      { title: <FormattedMessage id="general.expiry" />, dataIndex: 'expiry', key: 'expiry' },
      { title: <FormattedMessage id="general.product.cost" />, dataIndex: 'product_cost', key: 'product_cost' },
      { title: <FormattedMessage id="general.product.price" />, dataIndex: 'product_price', key: 'product_price' },
      { title: <FormattedMessage id="general.current_quantity" />, dataIndex: 'current_quantity', key: 'current_quantity' },
      {
        title: <FormattedMessage id="general.action" />,
        dataIndex: 'action_batch',
        key: 'action_batch',
        render: (text, row, batch_index) => (
          <span className="table-operation">
            <a onClick={() => this.showBatchDrawer(record.index, batch_index)}>
              <FormattedMessage id="general.detail" /></a>
            {this.state.allowDelete ?
              <React.Fragment>
                <Divider type="vertical" />
                <Popconfirm placement="topRight" title={formatMessage({ "id": "general.delete.batch.msg" })}
                  onConfirm={() => this.onConfirmDeleteBatch(product_barcode, batches[batch_index].batch_serial_number)}
                  okText={formatMessage({ "id": "general.yes" })}
                  cancelText={formatMessage({ "id": "general.no" })}>
                  <a ><FormattedMessage id="general.delete" /></a>
                </Popconfirm></React.Fragment> : null}

          </span>
        ),
      },
    ];
    // Re-map the batches
    batches.forEach(n => {
      n.key = n.id;
      n.current_quantity = (n.stocks)[0] ? formatNumber((n.stocks)[0].current_quantity) + " " + (n.stocks)[0].product_unit_name : 0;
      n.product_cost = (n.stocks)[0] ? formatNumber((n.stocks)[0].product_cost) : 0;
      n.product_price = (n.stocks)[0] ? formatNumber((n.stocks)[0].product_price) : 0;
    });
    return (
      <Table
        bordered={false}
        columns={columns}
        dataSource={batches}
        pagination={false}
      />
    );
  }

  onShowSizeChange = (current, pageSize) => {
    this.setState({
      limitedRecord: pageSize,
      page: current,
    }, () => {
      this.fetchProduct().then(this.reset())
    })
  }

  paginationChange = (pageNum, pageSize) => {
    this.setState({
      limitedRecord: pageSize,
      page: pageNum,
    }, () => {
      this.fetchProduct().then(this.reset())
    })
  }

  expandIcon = ({ expanded, expandable, record, onExpand }) => {
    if (!expandable || !record.batches || record.batches.length === 0) return null;
    return (
      <a onClick={e => onExpand(record, e)}>
        {expanded ? <Icon type="minus-square" /> : <Icon type="plus-square" />}
      </a>
    );
  }


  handleCancelModel = (e) => {
    this.setState({
      restockProgressVisible: false,
    });
  }

  handleDeleteProducts = () => {
    this.setState({loading: true})
    let barcodes = {};
    barcodes.product_barcodes = this.state.selectedRowKeys;
    return fetch(HOST + DELETE_PRODUCT_URL + `?user_id=${this.state.user_id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(barcodes)
    })
    .then(res => res.json())
    .then(res => {
      if (res.result){
        this.fetchProduct();
      } else {
        message.error(res.error);
      }
    }).then(this.reset())
  }

  render() {
    const { loading, selectedRowKeys, product_data, product_index, total, 
      batch_index, currentStep, restock_progress, barcode} = this.state;

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };

    const Info = ({ title, value, bordered }) => (
      <div className={styles.headerInfo}>
        <span>{title}</span>
        <p>{value}</p>
        {bordered && <em />}
      </div>
    );

    const hasSelected = selectedRowKeys.length > 0;
    return (
      <div className={styles.standardList}>
        <Card bordered={false}>
          <Row>
            <Col sm={8} xs={24}>
              <Info title={formatMessage({ "id": "general.total.products" })} value="8个任务" bordered />
            </Col>
            <Col sm={8} xs={24}>
              <Info title={formatMessage({ "id": "general.total.outOfStock" })} value="32分钟" bordered />
            </Col>
            <Col sm={8} xs={24}>
              <Info title={formatMessage({ "id": "general.total.waitReStock" })} value="24个任务" />
            </Col>
          </Row>
        </Card>
        <Card className={styles.listCard} style={{ marginTop: 24 }} bordered={false}>
          {this.state.allowDelete ? 
          <Button onClick={this.handleDeleteProducts} 
          disabled={selectedRowKeys.length === 0} 
          size="large" style={{marginBottom: 10}} type="primary">
          <Icon type="delete" theme="filled" />
          <FormattedMessage id="general.delete"/>
          </Button> : null}
          <ProductDrawer product={product_data[product_index]}
            onClose={this.onClose} visible={this.state.productDrawerVisible}
            product_providers={this.state.product_providers}
            product_unit={this.state.product_units}
            shelf_locations={this.state.shelf_locations}
            onRefresh={this.fetchProduct}
          />
          {BatchDrawer(product_data[product_index], batch_index, this.onCloseBatchDrawer, this.state.batchDrawerVisible)}
          <Table
            bordered
            pagination={{
              showSizeChanger: true, onShowSizeChange: this.onShowSizeChange, onChange: this.paginationChange,
              defaultCurrent: 1, defaultPageSize: 20, total: total, pageSizeOptions: ['20', '40', '60']
            }}
            loading={loading}
            rowSelection={this.state.allowDelete ? rowSelection : null}
            columns={productColumns(this.showDrawer, this.showModal)}
            expandIcon={this.expandIcon}
            expandedRowRender={this.expandedRowRender}
            dataSource={product_data}
          />
        </Card>
        <RestockProgress 
        onRefresh={this.fetchProduct}
        product_barcode = {barcode}
        restock_progress={restock_progress} 
        onCancel={this.handleCancelModel} visible={this.state.restockProgressVisible}/>
      </div>
    );
  }
}


export default ListProduct;