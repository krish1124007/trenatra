import axios from "axios";

async function sendPostRequest(url, headers, body) {
    try {
        console.log('Fetching Data From Api....')
        const response = await axios.post(url, body, {
            headers: headers
        })
        return response
    } catch (error) {
        const Error = error.response ? error.response.data : error.message
        return Error
    }
}

async function sendGetRequest(url, headers, body) {
    try {
        console.log('Fetching Data From Api....')
        const response = await axios.get(url, body, {
            headers: headers
        })
        return response
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

export { sendPostRequest, sendGetRequest }