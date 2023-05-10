import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as apigw from 'aws-cdk-lib/aws-apigateway'
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class TutorialCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDBの作成
    const table = new dynamodb.Table(this, 'counts', {
      partitionKey: { name: 'name', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // インサートを実施するLabmdaを追加
    const insert = new lambda.Function(this, 'InsertHandler', {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'insert.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        COUNT_TABLE_NAME: table.tableName
      }
    });

    // APIGW追加
    new apigw.LambdaRestApi(this, 'Endpoint', {
      handler: insert
    })

    // InsertHandlerに書き込み権限追加
    table.grantReadWriteData(insert);
  }
}
