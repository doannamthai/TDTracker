import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { formatMessage, FormattedMessage } from 'umi/locale';
import moment from 'moment';
import Auth from '../../../utils/Authentication';
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
  Alert,
  notification,
  Spin,
  AutoComplete,
  Checkbox,
} from 'antd';
import debounce from 'lodash/debounce';
//import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import styles from './NewProductStyle.less';
import { HOST, PRODUCT_URL, 
  PROVIDER_URL, SHELF_URL, 
  UNIT_URL, BATCH_URL, LATEST_BATCH_URL,
   LABEL_PRINT_URL, ADD_PRODUCT_URL, PRODUCT_NAME_URL} from '../../../../../api';
import {GET_ALL_PRINTERS, RETURN_VALUE} from '../../../utils/constants';

const FormItem = Form.Item;
const Panel = Collapse.Panel;
const { Option } = Select;
const { TextArea } = Input;
const dateFormatter = "DD-MM-YYYY";

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

const dates = [  
  "2020-01-12",
  "2020-02-29",
  "2019-10-02",
  "2020-04-17",
  "2021-01-31",
  "2020-04-02",
  "2020-02-11",
  "2019-10-14",
  "2021-04-08",
  "2019-11-09",
  "2020-01-24",
  "2020-01-03",
  "2019-12-12",
  "2020-05-14",
  "2021-02-20",
  "2019-08-31",
  "2020-06-08",
  "2019-09-27",
  "2020-10-27",
  "2019-07-17",
  "2019-08-24",
  "2021-01-13",
  "2020-09-02",
  "2020-04-08",
  "2019-06-19",
  "2020-11-26",
  "2021-01-07",
  "2020-08-13",
  "2019-06-10",
  "2020-11-01",
  "2021-01-07",
  "2019-07-22",
  "2020-12-14",
  "2020-08-27",
  "2021-05-01",
  "2020-10-29",
  "2019-10-07",
  "2020-05-07",
  "2020-09-23",
  "2021-02-16",
  "2019-11-19",
  "2020-08-24",
  "2019-08-20",
  "2021-01-16",
  "2019-10-05",
  "2021-03-24",
  "2020-03-11",
  "2020-12-12",
  "2020-11-03",
  "2020-03-16",
  "2021-03-27",
  "2020-11-17",
  "2019-09-29",
  "2021-01-09",
  "2021-03-16",
  "2020-02-27",
  "2020-02-15",
  "2020-06-19",
  "2019-09-07",
  "2020-06-08",
  "2021-02-16",
  "2019-12-22",
  "2019-10-14",
  "2019-12-29",
  "2020-09-14",
  "2020-03-19",
  "2020-06-09",
  "2021-03-10",
  "2019-08-11",
  "2019-06-05",
  "2019-11-18",
  "2020-08-08",
  "2019-10-17",
  "2019-12-04",
  "2019-08-20",
  "2020-06-04",
  "2021-02-25",
  "2020-07-27",
  "2020-03-11",
  "2019-11-10",
  "2020-05-14",
  "2020-02-10",
  "2021-02-05",
  "2019-09-13",
  "2019-09-28",
  "2019-06-03",
  "2020-11-15",
  "2019-08-08",
  "2019-07-26",
  "2019-09-06",
  "2021-03-18",
  "2021-04-13",
  "2020-03-26",
  "2019-06-05",
  "2019-07-05",
  "2019-10-09",
  "2019-10-07",
  "2019-06-27",
  "2019-12-20",
  "2021-02-23",
  "2020-07-26",
  "2020-09-26",
  "2019-09-03",
  "2021-05-02",
  "2019-12-18",
  "2019-06-13",
  "2021-02-10",
  "2019-07-01",
  "2020-05-29",
  "2020-10-08",
  "2021-05-02",
  "2020-04-23",
  "2019-10-05",
  "2020-09-02",
  "2021-04-12",
  "2020-07-07",
  "2019-09-03",
  "2020-10-05",
  "2020-07-12",
  "2020-08-10",
  "2019-09-20",
  "2020-01-03",
  "2020-05-06",
  "2021-04-17",
  "2020-11-05",
  "2021-02-21",
  "2021-01-25",
  "2020-04-01",
  "2019-06-01",
  "2020-10-29",
  "2020-12-11",
  "2019-08-15",
  "2020-04-23",
  "2019-06-20",
  "2020-02-17",
  "2019-09-29",
  "2019-06-11",
  "2020-07-18",
  "2021-04-01",
  "2019-09-03",
  "2020-02-18",
  "2020-06-24",
  "2020-03-22",
  "2020-01-04",
  "2019-09-12",
  "2021-03-25",
  "2020-04-16",
  "2020-08-05",
  "2020-12-21",
  "2019-06-19",
  "2019-09-14",
  "2020-09-16",
  "2019-06-28",
  "2020-03-26",
  "2020-08-12",
  "2019-07-12",
  "2019-12-24",
  "2020-01-13",
  "2019-06-24",
  "2019-08-17",
  "2020-08-20",
  "2020-10-22",
  "2020-02-16",
  "2019-08-11",
  "2020-05-07",
  "2019-06-17",
  "2021-01-30",
  "2019-10-06",
  "2020-02-10",
  "2020-02-08",
  "2019-08-28",
  "2021-04-18",
  "2019-11-17",
  "2019-11-14",
  "2020-04-13",
  "2020-10-29",
  "2020-02-27",
  "2019-12-25",
  "2020-07-13",
  "2019-08-14",
  "2020-12-20",
  "2019-07-04",
  "2020-04-19",
  "2019-12-03",
  "2020-07-25",
  "2021-02-01",
  "2021-02-21",
  "2020-11-14",
  "2021-03-17",
  "2020-03-23",
  "2020-11-08",
  "2021-02-12",
  "2019-09-16",
  "2020-12-15",
  "2020-05-15",
  "2019-07-13",
  "2020-08-16",
  "2020-04-03",
  "2019-07-21",
  "2020-12-12",
  "2019-11-17",
  "2019-12-27",
  "2020-01-10",
  "2019-06-17",
  "2021-01-20",
  "2019-09-15",
  "2019-07-09",
  "2019-10-14",
  "2020-11-09",
  "2020-03-16",
  "2020-04-26",
  "2020-11-22",
  "2020-05-14",
  "2020-07-07",
  "2020-04-07",
  "2019-09-29",
  "2019-09-13",
  "2019-09-29",
  "2020-10-17",
  "2019-10-25",
  "2021-03-01",
  "2020-01-07",
  "2019-09-18",
  "2020-05-28",
  "2019-08-04",
  "2020-04-24",
  "2019-07-28",
  "2020-01-10",
  "2020-02-07",
  "2019-12-06",
  "2020-01-29",
  "2019-10-18",
  "2020-12-19",
  "2020-02-19",
  "2019-12-28",
  "2021-01-02",
  "2021-03-04",
  "2019-06-23",
  "2019-09-13",
  "2019-07-15",
  "2020-09-22",
  "2020-09-04",
  "2020-02-15",
  "2020-09-22",
  "2020-10-06",
  "2020-10-29",
  "2021-04-29",
  "2020-01-17",
  "2020-02-13",
  "2019-12-31",
  "2020-05-08",
  "2020-03-22",
  "2020-07-21",
  "2020-02-16",
  "2021-03-17",
  "2021-03-10",
  "2019-10-19",
  "2020-10-15",
  "2020-10-01",
  "2020-10-11",
  "2020-09-01",
  "2019-12-01",
  "2020-04-08",
  "2020-08-13",
  "2019-06-19",
  "2021-04-27",
  "2020-05-06",
  "2020-07-03",
  "2020-03-18",
  "2020-06-18",
  "2020-04-12",
  "2020-09-24",
  "2019-12-22",
  "2019-10-20",
  "2019-09-08",
  "2020-11-28",
  "2020-08-22",
  "2020-12-26",
  "2019-12-05",
  "2020-05-06",
  "2020-05-31",
  "2020-12-23",
  "2020-12-14",
  "2021-02-05",
  "2020-02-22",
  "2020-06-07",
  "2020-01-17",
  "2020-12-30",
  "2020-05-01",
  "2020-08-26",
  "2020-05-09",
  "2020-01-03",
  "2020-06-30",
  "2021-01-24",
  "2020-07-02",
  "2021-02-02",
  "2020-11-23",
  "2019-11-03",
  "2020-09-08",
  "2020-01-10",
  "2019-12-13",
  "2019-11-10",
  "2020-09-22",
  "2020-12-04",
  "2019-09-22",
  "2021-01-12",
  "2020-04-22",
  "2020-05-14",
  "2021-03-19",
  "2021-04-17",
  "2020-02-15",
  "2020-04-11",
  "2020-11-09",
  "2020-10-27",
  "2020-02-06",
  "2020-04-11",
  "2021-04-30",
  "2021-03-20",
  "2019-08-27",
  "2021-04-03",
  "2019-10-13",
  "2019-06-16",
  "2021-03-28",
  "2019-06-19",
  "2020-03-12",
  "2020-11-26",
  "2020-11-16",
  "2019-11-12",
  "2021-01-01",
  "2019-06-02",
  "2020-08-29",
  "2020-11-10",
  "2021-03-16",
  "2020-10-25",
  "2019-06-01",
  "2020-09-09",
  "2020-11-20",
  "2019-06-16",
  "2020-06-05",
  "2019-11-15",
  "2020-03-23",
  "2020-07-25",
  "2019-11-18",
  "2021-04-13",
  "2020-03-10",
  "2019-11-07",
  "2020-05-19",
  "2021-03-31",
  "2019-11-22",
  "2019-06-07",
  "2019-12-07",
  "2019-12-03",
  "2020-05-05",
  "2021-03-13",
  "2019-11-11",
  "2020-09-28",
  "2020-08-07",
  "2020-02-08",
  "2021-04-06",
  "2019-06-19",
  "2020-09-02",
  "2020-12-23",
  "2020-11-28",
  "2019-06-22",
  "2019-07-18",
  "2019-09-05",
  "2019-11-12",
  "2020-04-09",
  "2020-06-13",
  "2019-08-18",
  "2020-12-15",
  "2020-08-13",
  "2021-02-02",
  "2020-09-12",
  "2021-02-24",
  "2019-11-01",
  "2019-10-06",
  "2019-07-20",
  "2020-06-19",
  "2020-10-30",
  "2021-01-29",
  "2021-04-15",
  "2020-12-31",
  "2020-10-14",
  "2019-12-06",
  "2021-02-04",
  "2019-12-13",
  "2020-04-15",
  "2021-02-17",
  "2021-03-14",
  "2019-08-23",
  "2020-01-09",
  "2020-12-02",
  "2019-07-29",
  "2019-08-11",
  "2019-07-14",
  "2019-10-07",
  "2020-11-19",
  "2020-11-26",
  "2021-01-21",
  "2020-08-16",
  "2021-03-01",
  "2019-08-31",
  "2020-06-12",
  "2020-12-18",
  "2020-07-30",
  "2019-12-08",
  "2020-05-26",
  "2021-04-17",
  "2020-01-28",
  "2020-01-13",
  "2019-07-19",
  "2020-05-16",
  "2019-07-16",
  "2019-07-13",
  "2019-08-04",
  "2019-10-17",
  "2019-10-06",
  "2021-04-23",
  "2019-12-12",
  "2020-12-22",
  "2020-08-31",
  "2020-07-19",
  "2019-08-16",
  "2021-03-19",
  "2020-03-15",
  "2020-07-25",
  "2020-10-18",
  "2020-03-04",
  "2020-08-25",
  "2019-09-13",
  "2020-03-09",
  "2019-10-06",
  "2019-09-06",
  "2019-11-01",
  "2019-06-12",
  "2020-07-20",
  "2019-11-24",
  "2020-06-18",
  "2020-03-08",
  "2020-01-03",
  "2020-03-17",
  "2020-03-31",
  "2020-02-23",
  "2021-01-02",
  "2020-01-03",
  "2020-01-09",
  "2020-02-25",
  "2020-10-17",
  "2019-07-04",
  "2020-12-21",
  "2020-06-07",
  "2021-03-07",
  "2020-12-19",
  "2019-11-19",
  "2019-08-10",
  "2020-04-19",
  "2021-02-03",
  "2020-07-12",
  "2019-11-26",
  "2020-08-03",
  "2021-01-23",
  "2019-06-26",
  "2019-09-08",
  "2019-12-24",
  "2020-07-17",
  "2019-08-24",
  "2020-02-22",
  "2019-09-21",
  "2020-10-26",
  "2021-04-26",
  "2021-01-21",
  "2019-06-07",
  "2019-10-01",
  "2020-02-14",
  "2020-11-09",
  "2020-08-30",
  "2019-08-30",
  "2020-02-13",
  "2021-03-10",
  "2020-07-31",
  "2020-12-15",
  "2021-03-18",
  "2020-10-10",
  "2021-01-19",
  "2020-11-06",
  "2020-02-16",
  "2020-05-30",
  "2020-10-11",
  "2019-07-05",
  "2019-12-12",
  "2021-03-05",
  "2020-02-23",
  "2020-09-24",
  "2021-01-08",
  "2020-11-15",
  "2020-12-11",
  "2019-11-03",
  "2021-01-05",
  "2019-08-10"
];

const initialState = {
  disableForm: false,
  showForm: false,
  editable: false,
  loading: false,
  printLoading: false,
  submitLoading: false,
  fetching: false,
  hasBatch: false,
  unChangedQuantity: false,
  product_providers: [],
  shelf_locations: [],
  product_units: [],
  product_info: null,
  batch_stock: [],
  activeKey: ["1"],
  printers: [],
  product_name_ls: [],
  user_id: Auth.getUserId(),

}

function calCost(cost, quan){
  if (quan === null || quan.length === 0 || quan === 0)
    return 0;
 return Math.round(cost / quan * 1000) / 1000;
};

@Form.create()
class ProductDetail extends PureComponent {
  constructor(props) {
    super(props);
    Auth.setUser("doannamthai", 1);
    this.state = initialState;
    notification.config({
      placement: 'bottomLeft',
    });
  }

  reset() {
    // Avoid some specific fields
    const { product_providers, shelf_locations, product_units, printers} = this.state;
    this.setState(initialState);
    this.setState({ product_providers, shelf_locations, product_units, printers})
  }

  makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  extremeTest(){
    let values = {
      barcode: 1234,
      batch_serial_number: "aa11",
      product_type: 0,
      product_name: "Name Test 1",
      product_provider: 1,
      expiry: "2020-04-20",
      product_location: 1,
      product_use: "This is the use",
      product_unit: [1, 1, 1],
      product_quantity: [10, 10],
      product_cost: [60000, 2000],
      product_current_quantity: [1, 29],
      product_price: [70000, 3000],
      user_entered_id: 1,
    };
    for (var i = 0; i < 500; i++){
      let b = Math.floor((Math.random() * 100000) + 1);
      values.barcode = b;
      values.batch_serial_number = this.makeid(5);
      values.expiry = dates[i];
      values.product_unit[0] = Math.floor((Math.random() * 11) + 1);
      values.product_unit[1] = Math.floor((Math.random() * 11) + 1);
      values.product_unit[2] = Math.floor((Math.random() * 11) + 1);
      values.product_quantity[0] = Math.floor((Math.random() * 60) + 1);
      values.product_quantity[1] = Math.floor((Math.random() * 60) + 1);
      values.product_quantity[2] = Math.floor((Math.random() * 60) + 1);
      values.product_cost[0] =  Math.floor((Math.random() * 200000) + 10000);
      values.product_cost[1] =  Math.floor((Math.random() * 200000) + 10000);
      values.product_cost[2] =  Math.floor((Math.random() * 200000) + 10000);
      values.product_current_quantity[0] = values.product_quantity[0];
      values.product_current_quantity[1] = values.product_quantity[1];
      values.product_current_quantity[2] = values.product_quantity[2];
      values.product_price[0] = values.product_cost[0] + 10000;
      values.product_price[1] = values.product_cost[1] + 10000;
      values.product_price[2] = values.product_cost[2] + 10000;

      fetch(HOST + ADD_PRODUCT_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(values),
      })
    }
  }
  
  componentDidMount() {
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

      // If this is broswer try to catch
      try {
        this.findPrinters();
      } catch {

      }
    
  }

  findLatestBatch(id) {
    return fetch(HOST + LATEST_BATCH_URL + "?product_barcode=" + id).then(res => res.json())
      .then(
        (res) => {
          if (!res.error && res.result.length > 0) {
            this.setState({ batch_stock: res.result, hasBatch: false })
          }
        }
      )
  }

  // Print label
  printLabel(){
    const { form: { getFieldValue }, } = this.props;
    const provider = getFieldValue("product_provider");
    const barcode = getFieldValue("barcode");
    const price = getFieldValue("product_price")[0];
    const copy = getFieldValue("barcode_quantity");

    this.setState({printLoading: true})
    return fetch(HOST + LABEL_PRINT_URL + `?provider=${provider}&barcode=${barcode}&price=${price}&pages=${copy}`, {
      method: 'POST'
    }).then(res => res.json())
    .then(
      (res) => {
        if (res.result && res.result.stdout.indexOf("#TDManager: Done") != -1){
          this.setState({printLoading: false})
        } else {
          this.setState({printLoading: false})
          message.error("ERROR: FAILED TO PRINT");
        }
      },
      (err) => {
        message.error("ERROR: FAILED TO CONNECT TO PRINTER");
        this.setState({printLoading: false});
      }
    )
  }

  // Find barcode and batch_serial_number in database
  findIndentifier(id, batch_serial_number) {
    return fetch(HOST + PRODUCT_URL + "?product_barcode=" + id + "&batch_serial_number=" + batch_serial_number)
      .then(res => res.json())
      .then(
        (res) => {
          if (!res.error) {
            // Check the returned result
            if (res.result.length != 0) {

              // If this batch_serial_number has batch associated
              if (res.result[0].stock.length != 0)
                this.setState({ product_info: res.result[0], editable: false, batch_stock: res.result[0].stock, hasBatch: true })
              else {
                // Find the most recent batch of this product
                this.findLatestBatch(id).then(this.setState({ product_info: res.result[0], editable: false }));
              }
            }
            else this.setState({ editable: true })

            setTimeout(() => {
              this.setState({ loading: false, showForm: true, activeKey: ["1", "2"], })
            }, 1000)
          }
        },
        (err) => {
          errorAlert(err + "");
          this.setState({ loading: false });
        }
      )
  }

  // Find all printers
  findPrinters(){
    let ipcRenderer = window.require('electron').ipcRenderer;
    ipcRenderer.send(GET_ALL_PRINTERS)
    ipcRenderer.on(RETURN_VALUE, (event, args) => {
      this.setState({ 
        printers: args,
      })
    })
  }
  // User clicks submit this form (final step)
  handleSubmit = e => {
    const { dispatch, form } = this.props;
    e.preventDefault();
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        console.log(JSON.stringify(values));
        this.setState({ submitLoading : true});
        values.user_entered_id = 1;
        let batch_serial_number= values.batch_serial_number;
        let product_name = values.product_name;
        let successMsg = `Thành viên ${Auth.getUsername()} đã nhập lô hàng số ${batch_serial_number} của sản phẩm ${product_name} vào kho hàng`;
        let failMsg = `Thành viên ${Auth.getUsername()} đã nhập lô hàng số ${batch_serial_number} của sản phẩm ${product_name} vào kho hàng`;
        fetch(HOST + ADD_PRODUCT_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(values),
        })
        .then(res => res.json())
        .then(
          (res) => {
          if (!res.error){
            notification.open({
            message: `Gửi thành công`,
              description: successMsg,
            });
          } else {
            notification.open({
              message: `Gửi thất bại`,
              description: failMsg,
            });
          };
          this.reset();
        },
          (err) => {
            console.log(err);
            this.setState({ submitLoading : false})
          }
        )
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

  // Click on submit button or update button at step 1
  applyIdentifier = () => {
    var showed = this.state.showForm;
    const { form } = this.props;
    if (!showed) {
      form.validateFields(['barcode', 'batch_serial_number'], (err, values) => {
        if (!err) {
          this.setState({ loading: true })
          // Find the identifier
          this.findIndentifier(form.getFieldValue('barcode'), form.getFieldValue('batch_serial_number'));
        }
      });
    } else {
      // Reset everything except the identifier fields
      this.reset();
      let a = form.getFieldValue('barcode');
      let b = form.getFieldValue('batch_serial_number');
      form.resetFields();
      form.setFieldsValue({ barcode: a, batch_serial_number: b });
    }
  }

  // Click on next button at step 2
  applyProductDetail = e => {
    const { dispatch, form } = this.props;
    const {disableForm} = this.state;
    e.preventDefault();
    if (!disableForm) {
      form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          this.setState({ disableForm: true, activeKey: ["1", "2", "3", "4"], })
        }
      });
    } else {
      this.setState({ disableForm: false, activeKey: ["1", "2"], })
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

  remove = (k, defaultFields) => {
    const { form } = this.props;
    // can use data-binding to get
    const stock = form.getFieldValue('batch_stock');

    // can use data-binding to set
    let newStock = [];
    let s = 0;
    for (var i = 0; i < stock.length; i++)
      if (i != k)
        newStock.push(s++)

    form.setFieldsValue({
      batch_stock: newStock,
    });
  }

  add = () => {
    const { form } = this.props;
    // can use data-binding to get
    const keys = form.getFieldValue('batch_stock');
    const nextKeys = keys.concat(keys[keys.length - 1] + 1);
    // can use data-binding to set
    // important! notify form to detect changes
    form.setFieldsValue({
      batch_stock: nextKeys,
    });
  }

  // Change current quantity of parent
  onChangeQuantity = (value) => {
    if (!this.state.unChangedQuantity || !value)
      return;
    const { form: { getFieldDecorator, getFieldValue, setFieldsValue}, } = this.props;
    let curr_quantity = getFieldValue('product_current_quantity');
    let init_quantity = getFieldValue('product_quantity');
    if (curr_quantity) {
        for (var i = 1;  i < curr_quantity.length; i++){
          if (init_quantity[i])
              curr_quantity[i] = value*init_quantity[i]
        }
        setFieldsValue({ product_current_quantity : curr_quantity});
    }
  }

  // Change initial quantity of children
  onChangeChildQuantity = index => v => {
    const { form: {getFieldValue, setFieldsValue}, } = this.props;
    // Update the cost
    let totalCost = getFieldValue('product_cost[0]');
    let cost = getFieldValue('product_cost');
    cost[index] = calCost(totalCost, v);
    let updatedCurrQuan = getFieldValue('product_current_quantity');

    // Update the child's current quantity if the checkbox is checked
    if (this.state.unChangedQuantity){
      let totalQuan = getFieldValue('product_current_quantity[0]');
      let initQuan = v;
      updatedCurrQuan[index] = totalQuan * initQuan;
    }
    setFieldsValue({ product_cost: cost, product_current_quantity: updatedCurrQuan})
  }

  onChangeProductCost = v => {
    const { form: { getFieldValue, setFieldsValue}, } = this.props;
    let arr = getFieldValue('product_quantity');
    for (var i = 1; i < arr.length; i++){
      arr[i] = calCost(v, arr[i]);
    }
    setFieldsValue({ 
      product_cost: arr,
    })
  }

  onCheckBoxChange = (e) => {
    let checked = !this.state.unChangedQuantity;
    this.setState({ unChangedQuantity : checked}, () => {
      if (checked) {
        const { form: { getFieldValue }, } = this.props;
        this.onChangeQuantity(getFieldValue('product_current_quantity[0]'));
      } 
    });
    
  }

  quantityFields(hasBatch, emptyBatch) {
    const {disableForm, unChangedQuantity} = this.state;
    const { form: { getFieldDecorator, getFieldValue, setFieldsValue}, } = this.props;
    let defaultFields = [0];
    // Initialize initial values for the stock inputs
    if (!emptyBatch)
      for (var t = 1; t < this.state.batch_stock.length; t++)
        defaultFields.push(t);

    // Add this to batch_stock attribute
    getFieldDecorator('batch_stock', { initialValue: defaultFields });
    const stock = getFieldValue('batch_stock');
    let data = this.state.batch_stock;
    // Disable field when this item belongs to default fields
    const isDisabled = (i) => hasBatch && (i < defaultFields.length);

    const fields = stock.map((s, index) => (
      <Form.Item  style={{ marginBottom: 0 }}
      {...formItemLayout}
        label={index === 0 ? formatMessage({ id: 'form.quantityAndprice.label' }) : formatMessage({ id: 'form.quantityAndprice.label' }) + ` ${index}`}
        required={false}
        key={index}
      >
        <Row gutter={4}>
          <Col style={{ height: '40px' }} span={4}>
            <Form.Item>
              {getFieldDecorator(`product_unit[${index}]`, {
                rules: [{
                  required: true,
                  message: formatMessage({ id: 'validation.field.required' }),
                },],
                initialValue: emptyBatch || data[index] == undefined ? null : data[index].product_unit,
              })(<Select
                showSearch
                disabled={disableForm || isDisabled(index)}
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
              {getFieldDecorator(`product_quantity[${index}]`, {
                rules: [{ required: true, message: formatMessage({ id: 'validation.field.required' }) }],
                initialValue: index === 0 ? 1 : (emptyBatch || data[index] == undefined ? null : data[index].initial_quantity),
                onChange: index == 0 ? null : this.onChangeChildQuantity(index),
              })(
                <InputNumber 
                disabled={disableForm || index === 0 || isDisabled(index)} 
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\D\s?|(,*)/g, '')}
                style={{ width: '100%' }} 
                min={index == 0 ? 0 : 1} placeholder={formatMessage({ id: 'form.product.quantity' })} />
              )}
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item>
              {getFieldDecorator(`product_cost[${index}]`, {
                rules: [{ required: true, message: formatMessage({ id: 'validation.field.required' }) }],
                initialValue: emptyBatch || data[index] == undefined ? 0 : data[index].product_cost,
                onChange: index === 0 ? this.onChangeProductCost : null,
              })(
                <InputNumber
                  disabled={disableForm || isDisabled(index) || index !== 0 }
                  formatter={value => `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\D\s?|(,*)/g, '')}
                  min={0}
                  style={{ width: '100%' }}
                  placeholder={formatMessage({ id: 'form.product.cost' })} />
              )}
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item>
              {getFieldDecorator(`product_current_quantity[${index}]`, {
                rules: [{ required: true, message: formatMessage({ id: 'validation.field.required' }) }],
                initialValue: index !== 0 || emptyBatch || data[index] == undefined ? null : data[index].product_current_quantity,
                onChange: index === 0 ? this.onChangeQuantity : null,
              })(
                <InputNumber 
                disabled={disableForm || (index !== 0 && unChangedQuantity)}
                formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\D\s?|(,*)/g, '')}
                style={{ width: '100%' }} 
                min={0} 
                placeholder={formatMessage({ id: 'form.product.currentquantity' })} />
              )}
            </Form.Item>
          </Col>
          <Col span={5}>
            <Form.Item>
              {getFieldDecorator(`product_price[${index}]`, {
                rules: [{ required: true, message: formatMessage({ id: 'validation.field.required' }) }],
                initialValue: emptyBatch || data[index] == undefined ? null : data[index].product_price,
              })(
                <InputNumber
                  disabled={disableForm || isDisabled(index)}
                  formatter={value => `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={value => value.replace(/\D\s?|(,*)/g, '')}
                  style={{ width: '100%' }}
                  placeholder={formatMessage({ id: 'form.product.price' })} />
              )}
            </Form.Item>
          </Col>
          <Col hidden={disableForm} span={1}>
            {stock.length > 1 && index != 0 && (!hasBatch || defaultFields.indexOf(index) == -1) ? (
              <Icon 
                
                className="dynamic-delete-button"
                type="minus-circle-o"
                onClick={() => this.remove(index, defaultFields)}
              />
            ) : null}
          </Col>
        </Row>
        {index == 0 ? <Divider  /> : null}
      </Form.Item>
    ));
    return fields;
  }

  fetchProductName = value => {
    this.setState({ fetching: true });
    fetch(HOST + PRODUCT_NAME_URL + `?name=${value}&distinct=true`)
      .then(response => response.json())
      .then((body) => {
        if (body.err){
          return;
        }
        let i = 0;
        const product_name_ls = body.result.map(n => ({
          text: `${n.product_name}`,
          value: n.product_name,
          id: i++,
        }));
        this.setState({ product_name_ls, fetching: false });
    });
  }


  onSelectName = (value) => {
    const { form: { setFieldsValue}, } = this.props;
    setFieldsValue({ product_name : value});
    this.setState({
      product_name_ls: [],
      fetching: false,
    });
  }



  

  render() {
    const { submitting } = this.props;
    const product = this.props.return;
    const { showForm, loading, product_info, batch_stock, hasBatch, disableForm, fetching, unChangedQuantity} = this.state;
    const { form: { getFieldDecorator, getFieldValue }, } = this.props;

    let disable = !this.state.editable;
    let hasProduct = product_info == null ? false : true;
    let emptyBatch = batch_stock == null || batch_stock.length === 0 ? true : false;

    return (
      <div>
        <Collapse activeKey={this.state.activeKey}>
          <Panel header={formatMessage({ id: 'form.identifier.label' })} key="1">
            <Form hideRequiredMark>
              <FormItem {...formItemLayout} label={<FormattedMessage id="form.din.label" />}>
                <Row gutter={4}>
                  <Col span={10}>
                    {getFieldDecorator('barcode', {
                      rules: [{ required: true, message: formatMessage({ id: 'validation.field.required' }) }],
                      initialValue: !hasProduct ? null : product_info.barcode,
                    })(
                      <InputNumber min={0} style={{ width: '100%' }} disabled={showForm} placeholder={formatMessage({ id: 'form.din.placeholder' })} />
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
                    {getFieldDecorator('batch_serial_number', {
                      rules: [{
                        required: true,
                        message: formatMessage({ id: 'validation.field.required' }),
                      },],
                      initialValue: !hasProduct ? null : product_info.batch_serial_number,
                    })(<Input disabled={showForm} placeholder={formatMessage({ id: 'form.batch.placeholder' })} />)}
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
          <Panel forceRender={showForm} header={formatMessage({ id: 'form.detail.label' })} key="2" disabled={this.state.activeKey.length < 2}>
            <Form onSubmit={this.handleSubmit} hideRequiredMark style={{ marginTop: 8 }}>
            
              <FormItem
                {...formItemLayout}
                label={<FormattedMessage id="form.productAttr.label" />}>
                {getFieldDecorator('product_type', {
                  initialValue: !hasProduct ? null : product_info.product_type,
                  rules: [{
                    required: true,
                    message: formatMessage({ id: 'validation.field.required' }),
                  },],
                })(
                  <Radio.Group disabled={disableForm || disable}>
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
                })(
                  <AutoComplete
                    style={{ width: '100%' }}
                    disabled={disableForm || disable}
                    dataSource={this.state.product_name_ls.map(d => <Option key={d.id} value={d.text}>{d.text}</Option>)}
                    onSelect={this.onSelectName}
                    onSearch={this.fetchProductName}
                    //onChange={this.handleChangeNameInput}
                    placeholder={formatMessage({ id: 'form.product.placeholder' })}                    
                    optionLabelProp="text"
                  >
                    <Input/>
                  </AutoComplete>
                )}
              </FormItem>
              <FormItem {...formItemLayout} label={<FormattedMessage id="form.provider.label" />}>
                {getFieldDecorator('product_provider', {
                  rules: [{
                    required: true,
                    message: formatMessage({ id: 'validation.field.required' }),
                  },],
                  initialValue: !hasProduct ? null : product_info.product_provider,
                })(<Select
                  disabled={disableForm || disable}
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
                  initialValue: !hasBatch ? null : moment(batch_stock[0].expiry, dateFormatter),
                  rules: [
                    {
                      required: true,
                      message: formatMessage({ id: 'validation.field.required' }),
                    },
                  ],
                })(
                  <DatePicker
                    disabled={disableForm || hasBatch}
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
                  disabled={disableForm || disable}
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
                    disabled={disableForm || disable}
                    style={{ minHeight: 32 }}
                    placeholder={formatMessage({ id: 'form.description.placeholder' })}
                    rows={4}
                  />
                )}
              </FormItem>
              <Divider  /> 
              <FormItem {...submitFormLayout}>
                <Checkbox disabled={hasBatch} onClick={this.onCheckBoxChange} checked={unChangedQuantity}>
                <FormattedMessage id="form.newproduct.confirm"/>
                </Checkbox>
              </FormItem>
              {this.quantityFields(hasBatch, emptyBatch)}
              <FormItem  {...submitFormLayout}>
                <Button disabled={disableForm} hidden={hasBatch} type="dashed" onClick={this.add} style={{ width: '60%' }}>
                  <Icon type="plus" /> {formatMessage({ id: 'form.add' })}
                </Button>
              </FormItem>
              <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
                <Button type="primary" onClick={this.applyProductDetail}>
                  <FormattedMessage id={!disableForm ? "form.next" : "form.update"} />
                </Button>
              </FormItem>
            </Form>
          </Panel>
          <Panel header={formatMessage({ id: 'form.barcode.label' })} key="3" disabled={this.state.activeKey.length < 3}>
            <Form hideRequiredMark>
              <FormItem {...formItemLayout} label={<FormattedMessage id="form.printquantity.label" />}>
                {getFieldDecorator('barcode_quantity', {
                  rules: [{ message: formatMessage({ id: 'validation.field.required' }) }],
                  initialValue: getFieldValue('product_quantity')[0] != null ? getFieldValue('product_quantity')[0].toString() : "0",
                })(
                  <InputNumber min={1} style={{ width: '100%' }} />
                )}
              </FormItem>
              <FormItem  {...formItemLayout} label={<FormattedMessage id="form.printer.label" />}>
                {getFieldDecorator('all_printers', {
                  rules: [{
                    message: formatMessage({ id: 'validation.field.required' }),
                  },],
                  initialValue: localStorage.getItem("defaultPrinter") ? null : localStorage.getItem("defaultPrinter")
                })(<Select
                  showSearch
                  placeholder={formatMessage({ id: 'form.product.unit' })}
                  optionFilterProp="children"
                  filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                >
                
                  {this.state.printers.map((p, i) =>
                    <Option key={i} value={p.name}>{p.name}</Option>
                  )}</Select>)}
              </FormItem>
              <FormItem {...submitFormLayout}>
                <Button loading={this.state.printLoading} type="primary" onClick={this.printLabel}>
                  <FormattedMessage id={"form.print"} /></Button>
              </FormItem>
            </Form>
          </Panel>
          <Panel header={formatMessage({ id: 'form.submit' })} key="4" disabled={this.state.activeKey.length < 3}>
              <FormItem {...submitFormLayout}>
                <Button loading={this.state.submitLoading} type="danger" block style={{width: '100px'}} onClick={this.handleSubmit}>
                  <FormattedMessage id={"form.submit"} /></Button>
              </FormItem>
          </Panel>
        </Collapse>
                
      </div>
    );
  }
}

export default ProductDetail;