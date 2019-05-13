import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi/locale';
import {
  Form,
  Input,
  DatePicker,
  Select,
  Button,
  Card,
  InputNumber,
  Radio,
  Icon,
  Tooltip,
  Divider,
  Row,
  Col,
  message,
  Collapse,
} from 'antd';
//import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './NewProductStyle.less';
import { HOST, PRODUCT_URL, PROVIDER_URL, SHELF_URL, UNIT_URL } from '../../../../../api';

const FormItem = Form.Item;
const Panel = Collapse.Panel;
const { Option } = Select;
const { TextArea } = Input;
const dateFormatter = "DD/MM/YYYY";

function errorAlert(err) {
  message.error(err);
}

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 7 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 24 },
    md: { span: 12 },
  },
};

const formItemLayoutWithOutLabel = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 7 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 12 },
  },
};

const submitFormLayout = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 7, offset: 7 },
  },
};

function callback(key) {
  console.log(key);
}

let id = 1;
@Form.create()
class ProductDetail extends PureComponent {
  constructor(props) {
    super(props);
    let s = this.props.data.formOne.showForm;
    let e = this.props.data.formOne.editable;
    this.state = {
      showForm: false || Boolean(s),
      editable: Boolean(e),
      loading: false,
      product_providers: [],
      shelf_locations: [],
      product_units: [],
      product_info: this.props.data.product,
      product_batches: [],
    }
  }


  componentDidMount() {
    this.fetchProviders();
    this.fetchShelves();
    this.fetchUnits();
  }

  fetchProviders() {
    return fetch(HOST + PROVIDER_URL, {
      method: 'GET',
    })
      .then(res => res.json())
      .then(
        (res) => {
          if (!res.error) {
            let arr = res.result;
            this.setState({
              product_providers: arr
            });
          }

        },
        (error) => console.log(error)
      )
  }

  fetchShelves() {
    return fetch(HOST + SHELF_URL, {
      method: 'GET',
    })
      .then(res => res.json())
      .then(
        (res) => {
          if (!res.error) {
            let arr = res.result;
            this.setState({
              shelf_locations: arr
            });
          }
        },
        (error) => console.log(error)
      )
  }



  fetchUnits() {
    return fetch(HOST + UNIT_URL, {
      method: 'GET',
    })
      .then(res => res.json())
      .then(
        (res) => {
          if (!res.error) {
            this.setState({
              product_units: res.result
            });
          }
        },
        (error) => console.log(error)
      )
  }

  findBarcode(id) {
    return fetch(HOST + PRODUCT_URL + "?id=" + id, {
      method: 'GET',
    })
      .then(res => res.json())
      .then(
        (res) => {
          if (!res.error) {
            if (res.result.length != 0) {
              this.setState({
                product_info: res.result[0],
                editable: false,
              })
            } else this.setState({ editable: true })
            setTimeout(() => {
              this.setState({ loading: false, showForm: true, })
            }, 1000)
          }
        },
        (err) => {
          errorAlert(err + "");
          this.setState({ loading: false });
        }
      )
  }

  handleSubmit = e => {
    const { dispatch, form } = this.props;
    e.preventDefault();
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log(values);
        this.props.setData("product", values);
        this.props.setData("formOne", { showForm: this.state.showForm, editable: this.state.editable })
        this.props.finish();
      }
    });
  };

  onFieldsChange(changedFields) {
    this.props.onChange(changedFields);
  };

  mapPropsToFields = () => {
    return {
      name: Form.createFormField({
        ...this.props.name,
        value: this.props.name.value,
      }),
    };
  };

  applyIdentifier = () => {
    var showed = this.state.showForm;
    const { form } = this.props;
    if (!showed) {
      form.validateFields(['barcode'], (err, values) => {
        if (!err) {
          this.setState({ loading: true })
          // Find the barcode
          this.findBarcode(form.getFieldValue('barcode'))

        }
      });
    } else {
      // Update barcode
      this.setState({
        product_info: null,
        showForm: !showed,
      })
      let a = form.getFieldValue('barcode');
      form.resetFields();
      form.setFieldsValue({ barcode: a, });
    }

  }

  generateBarcode = () => {
    let a = Math.floor((Math.random() * 100) + 100);
    this.props.form.setFields({
      barcode: {
        value: a,
      }
    })
  }

  remove = (k) => {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue('keys');
    // We need at least one passenger
    if (keys.length === 1) {
      return;
    }

    // can use data-binding to set
    form.setFieldsValue({
      keys: keys.filter(key => key !== k),
    });
  }

  add = () => {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue('keys');
    const nextKeys = keys.concat(id++);
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
      keys: nextKeys,
    });
  }




  render() {
    const { submitting } = this.props;
    const product = this.props.return;
    const { showForm, loading, product_info } = this.state;
    const { form: { getFieldDecorator, getFieldValue }, } = this.props;

    let disable = !this.state.editable;
    let hasProduct = product_info == null ? false : true;

    getFieldDecorator('keys', { initialValue: [0] });
    const keys = getFieldValue('keys');
    const quantityFields = keys.map((k, index) => (
      <Form.Item style={{ marginBottom: 0 }}
        {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
        label={index === 0 ? formatMessage({ id: 'form.quantityAndprice.label' }) : formatMessage({ id: 'form.quantityAndprice.label' }) + ` ${index}`}
        required={false}
        key={k}

      >
        <Row gutter={4}>
          <Col style={{ height: '40px' }} span={4}>
            <Form.Item>
              {getFieldDecorator(`product_unit[${k}]`, {
                rules: [{
                  required: true,
                  message: formatMessage({ id: 'validation.field.required' }),
                },],
                initialValue: !hasProduct ? null : product_info.product_provider,
              })(<Select
                showSearch
                placeholder={formatMessage({ id: 'form.product.unit' })}
                optionFilterProp="children"
                filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
              >
                {this.state.product_units.map(u =>
                  <Option key={u.id} value={u.id}>{u.name}</Option>
                )}</Select>)}
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item>
              {getFieldDecorator(`product_quantity[${k}]`, {
                rules: [{ required: true, message: formatMessage({ id: 'validation.field.required' }) }],
                initialValue: !hasProduct ? null : product_info.barcode,
              })(
                <InputNumber style={{ width: '100%' }} min={1} placeholder={formatMessage({ id: 'form.product.quantity' })} />
              )}
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item>
              {getFieldDecorator(`product_cost[${k}]`, {
                rules: [{ required: true, message: formatMessage({ id: 'validation.field.required' }) }],
                initialValue: !hasProduct ? null : product_info.barcode,
              })(
                <InputNumber
                  formatter={value => `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\D\s?|(,*)/g, '')}
                  min={1}
                  style={{ width: '100%' }}
                  placeholder={formatMessage({ id: 'form.product.cost' })} />
              )}
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item>
              {getFieldDecorator(`product_current_quantity[${k}]`, {
                rules: [{ required: true, message: formatMessage({ id: 'validation.field.required' }) }],
                initialValue: !hasProduct ? null : product_info.barcode,
              })(
                <InputNumber style={{ width: '100%' }} min={1} placeholder={formatMessage({ id: 'form.product.currentquantity' })} />
              )}
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item>
              {getFieldDecorator(`product_price[${k}]`, {
                rules: [{ required: true, message: formatMessage({ id: 'validation.field.required' }) }],
                initialValue: !hasProduct ? null : product_info.barcode,
              })(
                <InputNumber
                  formatter={value => `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\D\s?|(,*)/g, '')}
                  min={1}
                  style={{ width: '100%' }}
                  placeholder={formatMessage({ id: 'form.product.price' })} />
              )}
            </Form.Item>
          </Col>
          <Col span={1}>
            {keys.length > 1 && index !== 0 ? (
              <Icon
                className="dynamic-delete-button"
                type="minus-circle-o"
                onClick={() => this.remove(k)}
              />
            ) : null}
          </Col>
        </Row>

      </Form.Item>
    ));

    return (
      <div>
        <Collapse defaultActiveKey={['1']} onChange={callback}>
          <Panel header={formatMessage({ id: 'form.identifier.label' })} key="1">
            <Form hideRequiredMark>
              <FormItem {...formItemLayout} label={<FormattedMessage id="form.din.label" />}>
                <Row gutter={4}>
                  <Col span={10}>
                    {getFieldDecorator('barcode', {
                      rules: [{ required: true, message: formatMessage({ id: 'validation.field.required' }) }],
                      initialValue: !hasProduct ? null : product_info.barcode,
                    })(
                      <Input disabled={showForm} placeholder={formatMessage({ id: 'form.din.placeholder' })} />
                    )}
                  </Col>
                  <Col span={!showForm ? 4 : 0}>
                    <Button onClick={this.generateBarcode}><FormattedMessage id="form.generate" /></Button>
                  </Col>
                </Row>
              </FormItem>
              <FormItem {...formItemLayout} label={<FormattedMessage id="form.batch.label" />}>
                <Row gutter={4}>
                  <Col span={10}>
                    {getFieldDecorator('batch_id', {
                      rules: [{
                        required: true,
                        message: formatMessage({ id: 'validation.field.required' }),
                      },],
                      initialValue: !hasProduct ? null : product_info.batch_id,
                    })(<Input placeholder={formatMessage({ id: 'form.batch.placeholder' })} />)}
                  </Col>
                  <Col span={!showForm ? 4 : 0}>
                    <Button onClick={this.generateBarcode}><FormattedMessage id="form.generate" /></Button>
                  </Col>
                </Row>
              </FormItem>
              <FormItem {...submitFormLayout}>
                <Button loading={loading} type="primary" onClick={this.applyIdentifier}>
                  <FormattedMessage id={!showForm ? "form.submit" : "form.update"} /></Button>
              </FormItem>
            </Form>
          </Panel>
          <Panel header={formatMessage({ id: 'form.detail.label' })} key="2">
            <Form hidden={!showForm} onSubmit={this.handleSubmit} hideRequiredMark style={{ marginTop: 8 }}>
              <FormItem
                {...formItemLayout}
                label={<FormattedMessage id="form.productAttr.label" />}>
                {getFieldDecorator('product_type', {
                  initialValue: !hasProduct ? null : product_info.product_type,
                })(
                  <Radio.Group disabled={disable}>
                    <Radio value={0}>
                      <FormattedMessage id="form.productAttr.radio.prescription" />
                    </Radio>
                    <Radio value={1}>
                      <FormattedMessage id="form.productAttr.radio.otc" />
                    </Radio>
                  </Radio.Group>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label={<FormattedMessage id="form.product.label" />}>
                {getFieldDecorator('product_name', {
                  initialValue: hasProduct ? product_info.product_name : null,
                  rules: [{
                    required: true,
                    message: formatMessage({ id: 'validation.field.required' }),
                  },],
                })(<Input disabled={disable} placeholder={formatMessage({ id: 'form.product.placeholder' })} />)}
              </FormItem>
              <FormItem {...formItemLayout} label={<FormattedMessage id="form.provider.label" />}>
                {getFieldDecorator('product_provider', {
                  rules: [{
                    required: true,
                    message: formatMessage({ id: 'validation.field.required' }),
                  },],
                  initialValue: !hasProduct ? null : product_info.product_provider,
                })(<Select
                  disabled={disable}
                  showSearch
                  placeholder={formatMessage({ id: 'form.provider.placeholder' })}
                  optionFilterProp="children"
                  filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {this.state.product_providers.map(provider =>
                    <Option key={provider.id} value={provider.id}>{provider.name}</Option>
                  )}
                </Select>)}
              </FormItem>
              <FormItem {...formItemLayout} label={<FormattedMessage id="form.expiry.label" />}>
                {getFieldDecorator('expiry', {
                  initialValue: !hasProduct ? null : product_info.expiry,
                  rules: [
                    {
                      required: true,
                      message: formatMessage({ id: 'validation.field.required' }),
                    },
                  ],
                })(
                  <DatePicker
                    format={dateFormatter}
                    style={{ width: '100%' }}
                    placeholder={formatMessage({ id: 'form.expiry.placeholder' })}
                  />
                )}
              </FormItem>
              <FormItem
                {...formItemLayout}
                label={
                  <span>
                    <FormattedMessage id="form.location.label" />
                    <em className={styles.optional}>
                      <FormattedMessage id="form.optional" />
                      <Tooltip title={<FormattedMessage id="form.location.label.tooltip" />}>
                        <Icon type="info-circle-o" style={{ marginRight: 4 }} />
                      </Tooltip>
                    </em>
                  </span>
                }
              >
                {getFieldDecorator('product_location', {
                  initialValue: !hasProduct ? null : product_info.product_location,
                })(<Select
                  showSearch
                  disabled={disable}
                  placeholder={formatMessage({ id: 'form.location.placeholder' })}
                  optionFilterProp="children"
                  filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                  {this.state.shelf_locations.map(s =>
                    <Option key={s.id} value={s.id}>{s.shelf_name}</Option>
                  )}
                </Select>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label={
                <span>
                  <FormattedMessage id="form.description.label" />
                  <em className={styles.optional}>
                    <FormattedMessage id="form.optional" />
                  </em>
                </span>
              }>
                {getFieldDecorator('product_use', {
                  initialValue: !hasProduct ? null : product_info.product_use,
                })(
                  <TextArea
                    disabled={disable}
                    style={{ minHeight: 32 }}
                    placeholder={formatMessage({ id: 'form.description.placeholder' })}
                    rows={4}
                  />
                )}
              </FormItem>
            </Form>
          </Panel>
          <Panel header={formatMessage({ id: 'form.barcode.label' })} key="3" disabled>
            <Form hidden={!showForm} onSubmit={this.handleSubmit} hideRequiredMark style={{ marginTop: 8 }}>
              {quantityFields}
              <FormItem {...submitFormLayout}>
                <Button type="dashed" onClick={this.add} style={{ width: '60%' }}>
                  <Icon type="plus" /> Add field
                </Button>
              </FormItem>
              <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
                <Button type="primary" htmlType="submit">
                  <FormattedMessage id="form.next" />
                </Button>
              </FormItem>
            </Form>
          </Panel>
        </Collapse>


      </div>
    );
  }
}

export default ProductDetail;