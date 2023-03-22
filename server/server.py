from flask import Flask, request, jsonify
import json
from openpyxl import Workbook,load_workbook
from openpyxl.styles import *

Wb = load_workbook("1.xlsx")
Sheet = Wb["Sheet1"]
Paras = ["province", "city", "county", "address", "name", "category", "saleCarBrand", "saleShopLevel", "hotline", "serviceHotline", "state"]
count = 0

def insert(json):
    line = []
    for p in Paras:
        line.append(json[p])
    print(line)
    Sheet.append(line)
    global count
    count += 1

app = Flask(__name__)

@app.route('/post', methods=["POST"])
def calculatePost():
    data = request.get_data(as_text=True)
    data_json = json.loads(data)
    insert(data_json)
    return jsonify(content_type='application/json;charset=utf-8',
                   reason='success',
                   charset='utf-8',
                   status='200',
                   content="succuss")

@app.route('/stop', methods=["GET"])
def stop():
    print("stop")
    print(count)
    Wb.save("1.xlsx")
    return jsonify(content_type='application/json;charset=utf-8',
                   reason='success',
                   charset='utf-8',
                   status='200',
                   content="succuss")

if __name__ == '__main__':
    app.run(host='localhost', threaded=True, debug=False, port=3001)