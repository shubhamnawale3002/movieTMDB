import { LightningElement, track,wire } from 'lwc';
//import uploadJsonFile from '@salesforce/apex/movieParsing.uploadJsonFile';


export default class uploadJSON extends LightningElement {
    // @track jsonContent = '';
    // @wire(uploadJsonFile, { jsonData: '$jsonContent' })
    // wiredUploadJsonFile({ error }) {
    //     if (error) {
    //         // Handle error response from Apex
    //         console.error('Error from Apex:', error);
    //     }
    // }
    // handleFileChange(event) {
    //     console.log('File change event triggered');
    //     const fileInput = event.target;

    //     if (fileInput.files.length > 0) {
    //         const file = fileInput.files[0];

    //         // Check if the selected file is a JSON file
    //         if (file.type === 'application/json') {
    //             console.log('Selected file is a JSON file');
    //             const reader = new FileReader();

    //             reader.onload = (e) => {
    //                 console.log('FileReader: Loading completed');
    //                 // Get the entire file content
    //                 const rawJsonContent = e.target.result;

    //                 try {
    //                     // Parse the JSON content and stringify with indentation
    //                     this.jsonContent = JSON.stringify(JSON.parse(rawJsonContent), null, 2);
    //                     console.log('Final jsonContent:', this.jsonContent);
    //                 } catch (error) {
    //                     this.showError('Error parsing JSON: ' + error.message);
    //                 }
    //             };

    //             reader.readAsText(file);
    //         } else {
    //             // Handle the case where the selected file is not a JSON file
    //             console.log('Selected file is not a JSON file');
    //             this.showError('Please select a valid JSON file.');
    //         }
    //     }
    // }

    // showError(message) {
    //     // You can customize this method to display an error message
    //     // using Lightning Toast or any other suitable method.
    //     // For simplicity, we'll log the error to the console in this example.
    //     console.error('Error:', message);
    // }
}
