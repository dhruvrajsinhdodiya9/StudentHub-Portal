
<?php
// Accept only POST form submissions.
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    exit("Invalid request method. Please submit the form.");
}

// Read and trim the submitted values.
$name = trim($_POST["name"] ?? "");
$email = trim($_POST["email"] ?? "");
$phone = trim($_POST["phone"] ?? "");
$message = trim($_POST["message"] ?? "");

$errors = [];

// Validate the name.
if ($name === "") {
    $errors[] = "Name is required.";
} elseif (strlen($name) < 2) {
    $errors[] = "Name must contain at least 2 characters.";
}

// Validate the email.
if ($email === "") {
    $errors[] = "Email is required.";
} elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = "Please enter a valid email address.";
}

// Validate the phone number.
if ($phone === "") {
    $errors[] = "Phone number is required.";
} elseif (!preg_match("/^[0-9+\-\s]{10,15}$/", $phone)) {
    $errors[] = "Enter a valid phone number (10 to 15 characters).";
}

// Validate the message.
if ($message === "") {
    $errors[] = "Message is required.";
} elseif (strlen($message) < 5) {
    $errors[] = "Message must contain at least 5 characters.";
}

// Escape text safely when displaying it in HTML.
function e($value) {
    return htmlspecialchars($value, ENT_QUOTES, "UTF-8");
}

// Show validation errors and stop processing.
if (!empty($errors)) {
    ?>
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Validation Errors - StudentHub</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                background: #f3f6fa;
                padding: 30px;
            }
            .box {
                max-width: 600px;
                margin: 30px auto;
                padding: 25px;
                background: white;
                border-radius: 8px;
                border-left: 5px solid #c0392b;
            }
            h2 { color: #c0392b; }
            a { color: #1d4e89; }
        </style>
    </head>
    <body>
        <div class="box">
            <h2>Form Submission Failed</h2>
            <p>Please correct the following errors:</p>
            <ul>
                <?php foreach ($errors as $error): ?>
                    <li><?= e($error) ?></li>
                <?php endforeach; ?>
            </ul>
            <a href="index.php">Go back to the form</a>
        </div>
    </body>
    </html>
    <?php
    exit;
}

// Create the data folder if it does not exist.
$dataDirectory = __DIR__ . "/data";

if (!is_dir($dataDirectory)) {
    if (!mkdir($dataDirectory, 0755, true)) {
        exit("Unable to create the data folder.");
    }
}

// Open the CSV file in append mode.
$file = $dataDirectory . "/registrations.csv";
$handle = fopen($file, "a+");

if ($handle === false) {
    exit("Unable to open the CSV file.");
}

// Lock the file while writing to prevent overlapping writes.
if (!flock($handle, LOCK_EX)) {
    fclose($handle);
    exit("Unable to lock the CSV file.");
}

// Add column headings when the file is empty.
fseek($handle, 0, SEEK_END);

if (ftell($handle) === 0) {
    fputcsv($handle, [
        "Name", "Email", "Phone", "Message", "Submission Date"
    ]);
}

// Write the submitted record.
$record = [
    $name,
    $email,
    $phone,
    $message,
    date("Y-m-d H:i:s")
];

$saved = fputcsv($handle, $record);
fflush($handle);

flock($handle, LOCK_UN);
fclose($handle);

// Display an error if saving failed.
if ($saved === false) {
    exit("Unable to save the submitted record.");
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Submission Successful - StudentHub</title>

    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f3f6fa;
            text-align: center;
            padding: 60px 20px;
        }

        .success {
            max-width: 500px;
            margin: auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 0 10px #d0d8e2;
        }

        h2 {
            color: #218838;
        }

        a {
            display: inline-block;
            margin: 10px;
            color: #1d4e89;
        }
    </style>
</head>
<body>
    <div class="success">
        <h2>Registration Successful!</h2>
        <p>Your information has been saved successfully.</p>
        <p>Thank you for contacting StudentHub.</p>

        <a href="index.php">Submit Another Response</a>
        <a href="records.php">View Stored Records</a>
    </div>
</body>
</html>
