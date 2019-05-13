import { Component, Children } from "react";
import {
    HOST, AUTH_URL
  } from '../../../api';

class Authentication extends Component{
    constructor(props){
        super(props);
        this.state = {
            allow: false,
        };
    }

    componentWillMount(){
        fetch(HOST + AUTH_URL + `?user_id=${Authentication.getUserId()}&role_id=${this.props.role_id}`, {
            method: 'POST'
        })
        .then(res => res.json())
        .then(
            res => {
                if (res.result && res.result === true)
                    this.setState({allow: true})
                else 
                    this.setState({allow: false});
            }
        )
    }

    static isPermitted(user_id, role_id){
        return new Promise((resolve, reject) => {
        fetch(HOST + AUTH_URL + `?user_id=${user_id}&role_id=${role_id}`, {
            method: 'POST'
        })
        .then(res => res.json())
        .then(
            res => {
                if (res.result && res.result === true)
                    resolve(true);
                else 
                    resolve(false);
            }, 
            err => {reject(err)}
        )
        });
    }
    
    static getUserId(){
        return sessionStorage.getItem("user_id");
    }

    static getUsername(){
        return sessionStorage.getItem("username");
    }

    static setUser(username, id){
        sessionStorage.setItem("username", username)
        sessionStorage.setItem("user_id", id)
    }

    render(){
        const {allow} = this.state;
        return (
            <React.Fragment>{allow ? this.props.children : null}</React.Fragment>
        )
    }

}

export default Authentication;