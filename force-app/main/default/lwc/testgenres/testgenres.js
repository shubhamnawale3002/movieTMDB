import { LightningElement, track, wire } from 'lwc';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import MOVIE_GENRE_FIELD from '@salesforce/schema/Movie__c.Movie_Genre__c';
import filteredMoviesByGenres from "@salesforce/apex/MovieController.filteredMoviesByGenres";
import getMovieByGenre from "@salesforce/apex/MovieController.getMoviesByGenres";

export default class TestLWC extends LightningElement {
    @track activeAccordionSection;
    genrePicklistvalues;
    genreCondition = 'Or';
    selectedGenreValue = [];
    filterByGenres = [];
    get options() {
        return [
            { label: 'AND', value: 'And' },
            { label: 'OR', value: 'Or' },
        ];
    }
    @wire(getPicklistValues, {
        recordTypeId: '012000000000000AAA',
        fieldApiName: MOVIE_GENRE_FIELD
    })
    wiredGenreOptions({ data, error }) {
        console.log('inside wireddddddddd');
        if (data) {
            console.log('wiredGenreOptions ',data);
            this.genrePicklistvalues = data.values.map(item => ({
                label: item.label,
                value: item.value
            }));
        } else if (error) {
            console.error('Error fetching genre options:', error);
        }
    }
    handleConditionChange(event) {
        console.log('inside handleConditionChangeEvent');
        this.genreCondition = event.detail.value;
    }
    
    handleGenreChange(event) {
        this.activeAccordionSection = 'genresSection';
        console.log('handleGenreChange');
        this.selectedGenreValue = event.detail.value;
        if (this.selectedGenreValue.length > 0) {
            this.showAllMovies = false;
            this.allSelectedGenres = this.selectedGenreValue.join(';');
            this.handleAsyncOperation()
                .then((result) => {
                    this.filterByGenres = result;
                    console.log('this.filterByGenres',this.filterByGenres);
                })
                .catch((error) => {
                    console.error('Error fetching movie genres:', error);
                });
        } else {
            this.showAllMovies = false;
            this.filterByGenres = this.movies;
        }
    }

    handleAsyncOperation() {
        return new Promise((resolve, reject) => {
            if (this.genreCondition === 'Or') {
                filteredMoviesByGenres({ selectedGenres: this.allSelectedGenres })
                    .then((result) => {
                        this.filterByGenres = result;
                        
                        resolve(this.filterByGenres);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            } else if (this.genreCondition === 'And') {
                getMovieByGenre({ selectedGenres: this.allSelectedGenres })
                    .then((result) => {
                        this.filterByGenres = result;
                        resolve(this.filterByGenres);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            }
        });
    }
    
}