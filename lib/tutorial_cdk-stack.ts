import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class TutorialCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ステージを取得[デフォルト:dev]
    const stage = this.node.tryGetContext('stage')

    // ステージ別のコンテキストを取得
    const context = this.node.tryGetContext(stage)
    console.log(context)

    // DynamoDBの作成
    const table = new dynamodb.Table(this, `counts`, {
      partitionKey: { name: 'name', type: dynamodb.AttributeType.STRING },
      removalPolicy: cdk.RemovalPolicy.DESTROY
    });

    // インサートを実施するLabmdaを追加
    const insert = new lambda.Function(this, `InsertHandler`, {
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'insert.handler',
      code: lambda.Code.fromAsset('lambda'),
      environment: {
        COUNT_TABLE_NAME: table.tableName
      }
    });

    // InsertHandlerにDynamo書き込み権限追加
    table.grantReadWriteData(insert);

    // APIゲートウェイを作成
    const restApi = new cdk.aws_apigateway.RestApi(this, `RestAPI`, {
      restApiName: `Rest API ${stage}`,
      deployOptions: {
        stageName: 'v1',
      },
    });    

    // リクエスト先リソースを作成
    const restInsert = restApi.root.addResource('insert');

    // リソースにLambdaをアタッチ
    restInsert.addMethod('GET', new cdk.aws_apigateway.LambdaIntegration(insert))

  }
}
