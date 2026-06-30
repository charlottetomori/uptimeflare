import os

import requests

api_endpoint = f"https://api.cloudflare.com/client/v4/accounts/{os.environ['CLOUDFLARE_ACCOUNT_ID']}"
headers = {
    "Authorization": f"Bearer {os.environ['CLOUDFLARE_API_TOKEN']}",
}
kv_name = "uptimeflare_config"


def fetch_namespace_id():
    response = requests.get(
        api_endpoint + "/storage/kv/namespaces?per_page=1000",
        headers=headers,
    ).json()

    if not response["success"]:
        print("Error fetching KV namespace info: ", response)
        exit(1)

    for namespace in response["result"]:
        if namespace["title"] == kv_name:
            return namespace["id"]

    return ""


kv_id = fetch_namespace_id()

if kv_id == "":
    response = requests.post(
        api_endpoint + "/storage/kv/namespaces",
        headers=headers,
        json={"title": kv_name},
    ).json()

    if not response["success"]:
        print("Error creating KV namespace: ", response)
        exit(1)

    print("KV namespace created successfully: ", response)
    kv_id = response["result"]["id"]
else:
    print("KV namespace already exists, skipping creation.")

if kv_id == "":
    print("KV namespace not found after creation. Please inspect the Cloudflare API response and workflow permissions.")
    exit(1)

print(f"Got KV namespace ID: {kv_id}")

with open(os.environ["GITHUB_ENV"], "a") as f:
    f.write(f"KV_CONFIG_ID={kv_id}\n")
