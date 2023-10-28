import boto3
from datetime import datetime, timedelta
import json
import os
import urllib.request

s3 = boto3.client("s3")


def handler(event, context):
    bucket_name = os.environ["BUCKET_NAME"]
    file_name = "data.json"

    try:
        response = s3.get_object(Bucket=bucket_name, Key=file_name)

        json_data = response["Body"].read().decode("utf-8")
        json_array = json.loads(json_data)

        current_date = datetime.now() - timedelta(days=1)
        formatted_date = current_date.strftime("%Y-%m-%d")
        with urllib.request.urlopen(
            f"https://www.nytimes.com/svc/wordle/v2/{formatted_date}.json"
        ) as res:
            body = res.read()
            data = json.loads(body.decode('utf-8')).get("solution", None)
            if data is not None:
                if data in json_array:
                    print(f"Error: {data} already exists in data.json")
                    return
                json_array.append(data)
                s3.put_object(
                    Bucket=bucket_name,
                    Key=file_name,
                    Body=json.dumps(json_array),
                    ContentType="application/json",
                )
                print(f"Successfully updated data.json with {data}")
            else:
                print(f"Error: {res.status} {data}")
    except Exception as e:
        print(f"Error: {str(e)}")
