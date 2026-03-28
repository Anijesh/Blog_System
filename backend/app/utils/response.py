from flask import jsonify

def success_response(data=None, message="Success", status_code=200):
    return jsonify({
        "status":"success",
        "message": message,
        "data": data,
    }), status_code

def error_response(data=None, message = "Error", status_code =400):
    return jsonify({
        "status":'error',
        "message":message,
        "data":data
    }),status_code