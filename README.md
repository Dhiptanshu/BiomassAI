# Biomass Verification AI

## Description
Biomass Verification AI is a robust Progressive Web Application (PWA) designed to authenticate biomass imagery for environmental auditing and monitoring. The system leverages advanced computer vision to confirm the presence of biomass, employs geolocation validation to verify the origin of captures, and utilizes cryptographic hashing to prevent duplicate submissions. Designed with a mobile first approach, it ensures seamless operation across devices while maintaining strict data integrity standards.

## Technologies Used
*   **Backend Framework**: Django, Django REST Framework
*   **Machine Learning**: TensorFlow (MobileNetV2), NumPy
*   **Image Processing**: Pillow (PIL), ImageHash
*   **Frontend**: HTML5, CSS3 (Custom Properties), Vanilla JavaScript
*   **PWA Technologies**: Service Workers, Web App Manifest
*   **Database**: SQLite (Default)

## Installation and Setup

### Prerequisites
Ensure you have Python 3.8 or higher and pip installed on your system.

### Steps
1.  **Install Dependencies**
    Navigate to the project root and install the required Python packages:
    ```bash
    pip install -r requirements.txt
    ```

2.  **Database Migration**
    Initialize the database and apply the necessary schemas:
    ```bash
    python core/manage.py migrate
    ```

3.  **Run the Application**
    Start the unified Django server, which hosts both the API and the frontend:
    ```bash
    python core/manage.py runserver 0.0.0.0:8000
    ```

4.  **Access the App**
    *   **Local**: Open a web browser and navigate to `http://localhost:8000`.
    *   **Mobile / Remote**: Use a tunneling service like `ngrok` to expose port 8000 via HTTPS (e.g., `ngrok http 8000`). This is required for camera access on mobile devices.

## Key Features
*   **Automated Verification**: Uses MobileNetV2 to automatically detect tree and biomass presence in uploaded images.
*   **Geolocation Enforcement**: Validates EXIF GPS data against user location to prevent location spoofing.
*   **Duplicate Prevention**: Implements perceptual hashing (pHash) to detect and reject previously submitted images, even if they have been slightly modified.
*   **Progressive Web App**: Installable on mobile devices with offline capabilities and a responsive, app like interface.
*   **Secure API**: Validates all incoming data streams and enforces strict content rules.
