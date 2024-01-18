import { LightningElement, api, wire } from 'lwc';
import { getRecord } from 'lightning/uiRecordApi';

// Import the Movie__c object fields
import NAME_FIELD from '@salesforce/schema/Movie__c.Name';
import POSTER_URL_FIELD from '@salesforce/schema/Movie__c.PosterUrl__c';

export default class MovieCarousel extends LightningElement {
    // Define the fields to be retrieved
    @wire(getRecord, { recordId: '$recordId', fields: [NAME_FIELD, POSTER_URL_FIELD] })
    movie;

    // Getter for the Movie__c object fields
    get moviePosters() {
        if (this.movie.data) {
            return [
                {
                    Id: this.recordId,
                    Name: this.movie.data.fields.Name.value,
                    PosterUrl__c: this.movie.data.fields.PosterUrl__c.value,
                },
            ];
        } else {
            return [];
        }
    }

    // Getter for the recordId
    @api get recordId() {
        return this._recordId;
    }

    // Setter for the recordId
    set recordId(value) {
        this._recordId = value;
    }
}
