import { LightningElement, wire,track } from 'lwc';
import movieRecords from "@salesforce/apex/test.movieRecords";
import filteredMovies from "@salesforce/apex/test.filteredMovies";
//import filtereGenresMovies from "@salesforce/apex/test.filtereGenresMovies";
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import MOVIE_GENRE from '@salesforce/schema/Movie__c.Genres__c'
 
export default class MovieLwc extends LightningElement {
    data;
    value = '';
    selectedMovieId;
    selectedGenres;
    allSelectedGenres;
    selectedGenreMovie;
    genrePicklistvalues;
    selectedDecade;
    selectedDecadeMovie;
    @track selectedMovie;
    @wire(movieRecords)
    wiredData({ error, data }) {
        if (data) {
            this.data = data;
            console.log('Fetched data:', data);
            console.log('length: ' , data.length);
        } else if (error) {
            console.log('Error fetching data:', error);
        }
    }
    displayInfo = {
        additionalFields: ['TmdbId__c']
    }
   
    matchingInfo = {
        primaryField: { fieldPath: 'Name' },
        additionalFields: [ { fieldPath: 'TmdbId__c' } ]
    }
 
    handleMovieSelect(event) {
        this.selectedMovieId = event.detail.recordId;
        console.log("inside the handle Movie Select", this.selectedMovieId);
   
        if (this.selectedMovieId) {
            this.selectedMovie = this.data.find(movie => movie.Id == this.selectedMovieId);
            console.log(this.selectedMovie);
        } else {
            // No movie selected, reset selectedMovie
            this.selectedMovie = null;
        }
    }
    handleGenreChange(event) {
        this.selectedGenres = event.detail.value;
        console.log(this.selectedGenres);
        if (this.selectedGenres.length > 0) {
            this.allSelectedGenres = this.selectedGenres.join(';');
            console.log(this.allSelectedGenres);
            this.handleAsyncGenreOperation()
            .then((result) =>{
                console.log(result);
                this.data = result;
            })
            .catch((error) => {
                console.error('Error fetching movie genres:', error);
            });
        }  else{
            console.log('it is null');
        }
    }
    // handleAsyncGenreOperation(){
    //     return new Promise((resolve, reject) => {
    //         filtereGenresMovies({genreValue : this.allSelectedGenres})
    //         .then((result) => {
    //             this.selectedGenreMovie = result;
    //             resolve(this.selectedGenreMovie);
    //         })
    //         .catch((error) => {
    //             reject(error);
    //         });
    //     });
    // }
    handleDecadeChange(event){
        console.log('Inside Decade Change');
        this.selectedDecade = event.detail.value;
        this.handleAsyncOperation()
        .then((result) => {
            console.log(result);
            this.data=result;
        })
        .catch((error) => {
            console.error(error);
        });
    }
 
    handleAsyncOperation(){
        return new Promise((resolve, reject) => {
            filteredMovies({selectedDecade: this.selectedDecade })
            .then((result) => {
                this.selectedDecadeMovie = result;
                resolve(this.selectedDecadeMovie);
            })
            .catch((error) => {
                reject(error);
            });
        });
    }
 
 
    // async handleDecadeChange(event) {
    //     console.log('inside Decade Change');
    //     this.selectedDecade = event.detail.value;
    //     console.log('Selected Decade:', this.selectedDecade);
 
    //     try {
    //         await this.filterMovies();
    //     } catch (error) {
    //         console.error('Error in handleDecadeChange:', error);
    //     }
    // }
 
    // async filterMovies() {
    //     console.log('inside filter movies');
    //     try {
    //         if (this.selectedDecade) {
    //             // Call the Apex method to get filtered movies
    //             const filteredMoviesResult = await filteredMovies({ selectedDecade: this.selectedDecade });
 
    //             // Process the result as needed
    //             if (filteredMoviesResult && Array.isArray(filteredMoviesResult)) {
    //                 // Handle the filtered movies
    //                 this.selectedDecadeMovie = filteredMoviesResult;
    //             } else {
    //                 this.selectedDecadeMovie = null;
    //             }
    //             console.log('Filtered Movies with Details:', this.selectedDecadeMovie);
    //         } else {
    //             this.selectedDecadeMovie = null;
    //         }
    //     } catch (error) {
    //         console.error('Error in filterMovies:', error);
    //         throw error; // Re-throw the error to propagate it to the calling method
    //     }
    // }
 
   
   
 
 
    // For Options ....................
   
    @wire(getPicklistValues, {
        recordTypeId: '012000000000000AAA', // "Master" RecordTypeId of service type
        fieldApiName: MOVIE_GENRE
    })
    wiredGenreOptions({ error, data }) {
        if (data) {
            this.genrePicklistvalues = data.values.map(item => ({
                label: item.label,
                value: item.value
            }));
        }
        else if (error) {
            console.log('Error fetching data:', error);
        }
    }
    get conditionOptions(){
        return [
            {label: 'And', value: 'and'},
            {label: 'Or' , value: 'or'}
        ]
    }
 
 
    get generateDecadeOptions() {
        let decadeOptions = [];
        for (let i = 1920; i <= 2009; i += 10) {
            let startYear = i;
            let endYear = i + 9;
            let label = `${startYear}-${endYear}`;
            let value = `${startYear}-${endYear}`;
            decadeOptions.push({ label, value });
        }
        return decadeOptions;
    }
}