from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import util
import os

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return render_template("app.html")

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

@app.route('/get_location_names')
def get_location_names():
    response = jsonify({
        'locations': util.get_location_names()
    })
    
    return response

@app.route('/predict_home_price', methods=['POST'])
def predict_home_price():
    try:
        print("Request received")

        total_sqft = float(request.form['total_sqft'])
        bhk = int(request.form['bhk'])
        bath = int(request.form['bath'])
        location = request.form['location']

        print("INPUT:", location, total_sqft, bath, bhk)

        price = util.get_estimated_price(location, total_sqft, bath, bhk)

        print("PREDICTED:", price)

        response = jsonify({
            'estimated_price': price
        })

        return response

    except Exception as e:
        print("ERROR:", e)
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    print("Starting server...")
    util.load_saved_artifacts()
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)