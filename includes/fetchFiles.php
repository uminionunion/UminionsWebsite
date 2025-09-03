<?php
include 'db.Conn.Ver01.php';

// Base directory for files
$baseDirectory = '/URTesting001/uploads';

// SQL query to fetch audio details
$sql = "SELECT id, audio_title_user_uploaded, audio_description, audio_url, audio_logo_url FROM audios";
$result = $conn->query($sql);

$files = [];

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        // Construct full paths by combining base directory with relative paths from the database
        $files[] = [
            'id' => $row['id'],
            'title' => $row['audio_title_user_uploaded'],
            'description' => $row['audio_description'],
            'audioUrl' => $baseDirectory . '/' . $row['audio_url'],
            'logoUrl' => $baseDirectory . '/' . $row['audio_logo_url']
        ];
    }
    echo json_encode(['status' => 'success', 'files' => $files]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'No files found']);
}

$conn->close();
?>
