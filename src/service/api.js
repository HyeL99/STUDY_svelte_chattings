import axios from "axios";

const send = async ({method='', path='', data={}, accessToken=''} = {}) => {
  const commonUrl = 'http://localhost:3000';
  const url = commonUrl + path;

  const headers = {
    'Access-Control-Allow-Origin': commonUrl,
    'Access-Control-Allow-Credentials': true,
    'content-type': 'application/json;charset=UTF-8',
    'accept': 'application/json',
    'SameSite': 'None',
    'Authorization': accessToken
  }

  const options = {method, url, headers, data, withCredentials: true};

  try{
    const response = await axios(options);
    return response.data;
  } catch (e) {throw e};
};

const getApi = ({path='', accessToken=''} = {}) => send({method: 'GET', path, accessToken});
const putApi = ({path='', data={}, accessToken=''} = {}) =>  send({method: 'PUT', path, data, accessToken});
const postApi = ({path='', data={}, accessToken=''} = {}) =>  send({method: 'POST', path, data, accessToken});
const delApi = ({path='', data={}, accessToken=''} = {}) =>  send({method: 'DELETE', path, data, accessToken});

export {getApi, putApi, postApi, delApi};