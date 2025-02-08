import axios from 'axios';

const deleteSchema = async (id, url, bearerToken) => {
    try {
    const data = JSON.stringify({
        "id": id
    });

    const config = {
        method: 'delete',
        maxBodyLength: "Infinity",
        url: `${url}/api/v1/schemas`,
        headers: { 
            'Accept': 'application/json', 
            'Authorization': `Bearer ${bearerToken}`
        },
        data : data
    }

    console.log(config);

    const response = await axios.request(config);
    console.log(response.data);
    return response.data;
    } catch (error) {
        console.error('❌ Failed to delete schema:', error.response.data);
        process.exit(1);
    }
}

export default deleteSchema;