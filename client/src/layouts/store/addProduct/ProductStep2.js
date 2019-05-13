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
} from 'antd';
//import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './NewProductStyle.less';
import {PRODUCT_URL, PROVIDER_URL, SHELF_URL} from '../../../api/API';

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;
const dateFormatter = "DD/MM/YYYY";

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 7 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 12 },
    md: { span: 10 },
  },
};

const submitFormLayout = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 10, offset: 7 },
  },
};

@Form.create()
class ProductDetail extends PureComponent {
  constructor(props){
    super(props);
    let s = this.props.data.formOne.showForm;
    let e = this.props.data.formOne.editable;
    this.state = {
      showForm: Boolean(s),
      editable: Boolean(e),
      loading: false,
      product_providers: [],
      shelf_locations: [],
      product_info: this.props.data.product,
    }
  }
  

  componentDidMount(){
    this.fetchProviders();
    this.fetchShelves();
  }

  fetchProviders(){
    return fetch(PROVIDER_URL, {
      method: 'GET',
    })
    .then(res => res.json())
    .then(
      (res) => {
        if (!res.error){
          let arr = res.result;
          this.setState({
            product_providers: arr
          });
        }
        
      },
      (error) => console.log(error)
      )
  }

  fetchShelves(){
    return fetch(SHELF_URL, {
      method: 'GET',
    })
    .then(res => res.json())
    .then(
      (res) => {
        if (!res.error){
          let arr = res.result;
          this.setState({
            shelf_locations: arr
          });
        }
      },
      (error) => console.log(error)
      )
  }

  findBarcode(id){
    return fetch(PRODUCT_URL + "?id=" + id, {
      method: 'GET',
    })
    .then(res => res.json())
    .then(
      (res) => {
        if (!res.error){
          if (res.result.length != 0){
            this.setState({
              product_info: res.result[0],
              editable: false,
            })
          } else this.setState({editable: true})
          
        }
      },
      (error) => console.log(error)
    )
  }

  handleSubmit = e => {
    const { dispatch, form } = this.props;
    e.preventDefault();
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.props.setData("product", values);
        this.props.setData("formOne", {showForm: this.state.showForm, editable: this.state.editable})
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
        if (!err){
          this.setState({ loading: true })
          // Find the barcode
          this.findBarcode(form.getFieldValue('barcode')).then(
            setTimeout(() => {
              this.setState({loading: false, showForm: !showed})
            }, 1000)
          )
          
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
      form.setFieldsValue({barcode: a,});
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


  render() {
    const { submitting } = this.props;
    const product = this.props.return;
    const {showForm, loading, product_info} = this.state;
    const {form: { getFieldDecorator, getFieldValue },} = this.props;

    let disable = !this.state.editable;
    let hasProduct = product_info == null ? false : true;
 
    
    return (
      <div>
        <Form {...formItemLayout} hideRequiredMark>
          <FormItem label={<FormattedMessage id="form.din.label" />}>
            <Row gutter={12}>
              <Col span={12}>
                {getFieldDecorator('barcode', {
                  rules: [{ required: true, message: formatMessage({ id: 'validation.field.required' }) }],
                  initialValue: !hasProduct ? null : product_info.barcode,
                })(
                  <Input disabled = {showForm} placeholder={formatMessage({ id: 'form.din.placeholder' })} />
                )}
              </Col>
              <Col span={12}>
                { !showForm ? <Button onClick={this.generateBarcode}><FormattedMessage id="form.generate" /></Button> : null}
                <Button loading={loading} type="primary" style={{marginLeft: 8}} onClick={this.applyIdentifier}><FormattedMessage id={!showForm ? "form.submit" : "form.update"} /></Button>
              </Col>
            </Row>
          </FormItem>
        </Form>
        <Divider/>
         <Form hidden = {!showForm} onSubmit={this.handleSubmit} hideRequiredMark style={{ marginTop: 8 }}>
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
            <FormItem {...formItemLayout} label={<FormattedMessage id="form.batch.label" />}>
              {getFieldDecorator('batch_id', {
                rules: [{
                    required: true,
                    message: formatMessage({ id: 'validation.field.required' }),
                  },],
                initialValue: !hasProduct ? null : product_info.batch_id,
              })(<Input placeholder={formatMessage({ id: 'form.batch.placeholder' })} />)}
            </FormItem>
            <FormItem {...formItemLayout} label={<FormattedMessage id="form.product.label" />}>
              {getFieldDecorator('product_name', {
                initialValue: hasProduct  ? product_info.product_name : null,
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
                initialValue: !hasProduct ? null: product_info.product_use,
              })(
                <TextArea
                  disabled={disable}
                  style={{ minHeight: 32 }}
                  placeholder={formatMessage({ id: 'form.description.placeholder' })}
                  rows={4}
                />
              )}
            </FormItem>
            
            <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
              <Button type="primary" htmlType="submit">
                <FormattedMessage id="form.next" />
              </Button>
              
            </FormItem>
          </Form>
          </div>
    );
  }
}

export default ProductDetail;