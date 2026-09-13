import os
import json
import urllib.request
import urllib.parse
from django.conf import settings

def get_supabase_config():
    base_url = os.getenv('SUPABASE_URL', 'https://hytzgimcitwdvsdzgjxz.supabase.co').rstrip('/')
    api_key = os.getenv('SUPABASE_KEY', os.getenv('SUPABASE_ANON_KEY', 'sb_publishable_m0s-xmDsN3rKnYRdt8Z3Ag_hzf15P8O'))
    return base_url, api_key

def supabase_request(endpoint, method='GET', data=None, params=None, extra_headers=None):
    base_url, api_key = get_supabase_config()
    url = f"{base_url}/rest/v1/{endpoint}"
    if params:
        query_string = urllib.parse.urlencode(params)
        url = f"{url}?{query_string}"

    headers = {
        'apikey': api_key,
        'Authorization': f"Bearer {api_key}",
        'Content-Type': 'application/json',
    }
    if extra_headers:
        headers.update(extra_headers)

    body_bytes = json.dumps(data).encode('utf-8') if data is not None else None
    req = urllib.request.Request(url, data=body_bytes, headers=headers, method=method)

    with urllib.request.urlopen(req, timeout=15) as resp:
        content = resp.read().decode('utf-8')
        if content:
            return json.loads(content)
        return None

def fetch_table(table_name, select='*', limit=1000, order=None):
    params = {'select': select, 'limit': limit}
    if order:
        params['order'] = order
    return supabase_request(table_name, method='GET', params=params)

def count_table(table_name):
    base_url, api_key = get_supabase_config()
    url = f"{base_url}/rest/v1/{table_name}?select=count"
    req = urllib.request.Request(
        url,
        headers={
            'apikey': api_key,
            'Authorization': f"Bearer {api_key}",
            'Range-Unit': 'items',
            'Prefer': 'count=exact'
        }
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        cr = resp.headers.get('Content-Range', '')
        if '/' in cr:
            total = cr.split('/')[-1]
            if total.isdigit():
                return int(total)
    return 0

def insert_record(table_name, record_dict):
    extra = {'Prefer': 'return=representation'}
    return supabase_request(table_name, method='POST', data=record_dict, extra_headers=extra)

def update_record(table_name, filter_col, filter_val, update_dict):
    endpoint = f"{table_name}?{filter_col}=eq.{filter_val}"
    extra = {'Prefer': 'return=representation'}
    return supabase_request(endpoint, method='PATCH', data=update_dict, extra_headers=extra)

def delete_record(table_name, filter_col, filter_val):
    endpoint = f"{table_name}?{filter_col}=eq.{filter_val}"
    return supabase_request(endpoint, method='DELETE')
