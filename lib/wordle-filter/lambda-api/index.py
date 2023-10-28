import boto3
import json
import os

s3 = boto3.client("s3")


def handler(event, context):
    http_method = event["httpMethod"]

    allowed_domains = ["https://www.dodgez.dev", "http://localhost:3000"]

    origin = event.get("headers", {}).get("origin", "")

    headers = {
        "Access-Control-Allow-Methods": "GET,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Api-Key",
    }

    if http_method == "OPTIONS" and origin in allowed_domains:
        headers["Access-Control-Allow-Origin"] = origin
        return {
            "statusCode": 200,
            "headers": headers,
            "body": json.dumps({"message": "CORS Preflight Request Handled"}),
        }

    if origin in allowed_domains:
        headers["Access-Control-Allow-Origin"] = origin

    bucket_name = os.environ["BUCKET_NAME"]
    file_name = "data.json"

    try:
        response = s3.get_object(Bucket=bucket_name, Key=file_name)

        json_data = response["Body"].read().decode("utf-8")
        json_array = json.loads(json_data)

        return {
            "body": json.dumps(json_array),
            "headers": headers,
            "statusCode": 200,
        }
    except Exception as e:
        print(f"Error: {str(e)}")
        return {"statusCode": 500, "body": "Error reading JSON from S3"}
