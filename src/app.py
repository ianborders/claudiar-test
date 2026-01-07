"""Flask web application for the calculator with 8-bit arcade UI."""

from flask import Flask, render_template, request, jsonify
from calculator import add, subtract, multiply, divide, power

app = Flask(__name__)


@app.route("/")
def index():
    """Render the calculator UI."""
    return render_template("index.html")


@app.route("/calculate", methods=["POST"])
def calculate():
    """Handle calculation requests."""
    data = request.get_json()

    try:
        a = float(data.get("a", 0))
        b = float(data.get("b", 0))
        operation = data.get("operation", "add")

        operations = {
            "add": add,
            "subtract": subtract,
            "multiply": multiply,
            "divide": divide,
            "power": power,
        }

        if operation not in operations:
            return jsonify({"error": "Invalid operation"}), 400

        result = operations[operation](a, b)
        return jsonify({"result": result})

    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except (TypeError, KeyError) as e:
        return jsonify({"error": f"Invalid input: {e}"}), 400


if __name__ == "__main__":
    app.run(debug=True, port=5000)
