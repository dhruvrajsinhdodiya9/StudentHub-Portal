
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>StudentHub - Contact Form</title>

    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f3f6fa;
            margin: 0;
            padding: 30px;
            color: #263648;
        }

        header {
            background: #12355b;
            color: white;
            padding: 18px;
            text-align: center;
            border-radius: 8px;
        }

        .container {
            max-width: 520px;
            margin: 25px auto;
            background: white;
            padding: 25px;
            border-radius: 8px;
            box-shadow: 0 0 10px #d0d8e2;
        }

        h2 {
            text-align: center;
            color: #12355b;
        }

        label {
            display: block;
            margin-top: 14px;
            font-weight: bold;
        }

        input, textarea {
            width: 100%;
            padding: 10px;
            margin-top: 5px;
            box-sizing: border-box;
            border: 1px solid #bcc8d4;
            border-radius: 5px;
            font-size: 15px;
        }

        textarea {
            height: 110px;
            resize: vertical;
        }

        button {
            width: 100%;
            margin-top: 20px;
            padding: 12px;
            background: #1d4e89;
            color: white;
            border: none;
            cursor: pointer;
            border-radius: 5px;
            font-size: 16px;
        }

        button:hover {
            background: #12355b;
        }

        .records-link {
            display: block;
            text-align: center;
            margin-top: 18px;
        }

        a {
            color: #1d4e89;
        }
    </style>
</head>

<body>
<header>
    <h1>StudentHub Portal</h1>
    <p>CHARUSAT Student Contact Form</p>
</header>

<div class="container">
    <h2>Registration / Contact Form</h2>

    <form action="process.php" method="POST">
        <label for="name">Full Name:</label>
        <input type="text" id="name" name="name"
               maxlength="100" required>

        <label for="email">Email Address:</label>
        <input type="email" id="email" name="email"
               maxlength="150" required>

        <label for="phone">Phone Number:</label>
        <input type="tel" id="phone" name="phone"
               maxlength="15" required>

        <label for="message">Message:</label>
        <textarea id="message" name="message"
                  maxlength="500" required></textarea>

        <button type="submit">Submit Form</button>
    </form>

    <a class="records-link" href="records.php">
        View Stored Records
    </a>
</div>
</body>
</html>
