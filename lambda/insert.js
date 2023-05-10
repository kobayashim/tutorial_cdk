const { DynamoDB } = require('aws-sdk');

exports.handler = async function(event) {
    const dynamo = new DynamoDB();

    await dynamo.putItem({
        TableName: process.env.COUNT_TABLE_NAME,
        Item: {
            name: { S: event.queryStringParameters.name },
            value: { S: event.queryStringParameters.value }
        }
    }).promise();

    return {
        statusCode: 200,
        headers: { "Content-Type": "text/plain" },
        body: `OK ${event.queryStringParameters.name} = ${event.queryStringParameters.value}`
    };    
}