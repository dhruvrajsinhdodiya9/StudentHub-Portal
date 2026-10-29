
<?php
// Location of the saved CSV file.
$file = __DIR__ . "/data/registrations.csv";

// Escape values before displaying them in HTML.
function e($value) {
    return htmlspecialchars((string)$value, ENT_QUOTES, "UTF-8");
}

$rows = [];
$error = "";

if (file_exists($file)) {
    $handle = fopen($file, "r");

    if ($handle !== false) {
        while (($row = fgetcsv($handle)) !== false) {
            $rows[] = $row;
        }

        fclose($handle);
    } else {
        $error = "Unable to read the stored records.";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Stored Records - StudentHub</title>

    <style>
        body {
            font-family: Arial, sans-serif;
            background: #f3f6fa;
            padding: 25px;
            color: #263648;
        }

        .container {
            max-width: 1100px;
            margin: auto;
            background: white;
            padding: 22px;
            border-radius: 8px;
            box-shadow: 0 0 10px #d0d8e2;
        }

        h2 {
            color: #12355b;
            text-align: center;
        }

        .table-wrap {
            overflow-x: auto;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }

        th, td {
            border: 1px solid #d0d8e2;
            padding: 10px;
            text-align: left;
        }

        th {
            background: #1d4e89;
            color: white;
        }

        tr:nth-child(even) {
            background: #f3f6fa;
        }

        a {
            display: inline-block;
            margin-top: 20px;
            color: #1d4e89;
        }

        .empty {
            text-align: center;
            padding: 20px;
        }
    </style>
</head>

<body>
<div class="container">
    <h2>StudentHub - Stored Registration Records</h2>

    <?php if ($error !== ""): ?>

        <p><?= e($error) ?></p>

    <?php elseif (count($rows) <= 1): ?>

        <p class="empty">No records found. Submit the form first.</p>

    <?php else: ?>

        <div class="table-wrap">
            <table>
                <thead>
                    <tr>
                        <?php foreach ($rows[0] as $heading): ?>
                            <th><?= e($heading) ?></th>
                        <?php endforeach; ?>
                    </tr>
                </thead>

                <tbody>
                    <?php foreach (array_slice($rows, 1) as $row): ?>
                        <tr>
                            <?php foreach ($rows[0] as $index => $heading): ?>
                                <td><?= e($row[$index] ?? "") ?></td>
                            <?php endforeach; ?>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>

    <?php endif; ?>

    <a href="index.php">Back to Registration Form</a>
</div>
</body>
</html>
