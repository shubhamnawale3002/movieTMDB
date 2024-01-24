import { LightningElement, wire } from "lwc";
import getMovies from "@salesforce/apex/test.movieRecords";
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
//import MOVIE_GENRE_FIELD from '@salesforce/schema/Movie__c.Genres__c';
//import getSelectedGenresMovie from "@salesforce/apex/TestMovieLwcController.getSelectedGenresMovie";
 
export default class TestMovieLwc extends LightningElement {
    data = [];
    movieData = [];
    selectedMovieId = null;
    selectedMovieDetails = null;
    showSelectedMovie = false;
    showAllMovies = true;
    genrePicklistvalues;
    isChecked =false;
 
 
    movieByGenres = [] ;
 
 
    // @wire(getPicklistValues, {
    //     recordTypeId: '012000000000000AAA', // "Master" RecordTypeId of service type
    //     fieldApiName: MOVIE_GENRE_FIELD
    // })
    // wiredGenreOptions({ error, data }) {
    //     if (data) {
    //         this.genrePicklistvalues = data.values.map(item => ({
    //             label: item.label,
    //             value: item.value
    //         }));
    //     }
    // }
 
    displayInfo = {
        additionalFields: ['TmdbId__c']
    }
 
    matchingInfo = {
        primaryField: { fieldPath: 'Name' },
        additionalFields: [ { fieldPath: 'TmdbId__c' } ]
    }
 
    showDropdown = true;
    selectedGenreValue =[];
    allSelectedGenres;
    get selectedValues() {
       // this.allSelectedGenres = this.selectedGenreValue.join(';');
        return this.selectedGenreValue.join(';');
    }
    handleChange(e) {
        this.selectedGenreValue = e.detail.value;
        console.log(this.selectedGenreValue);
        console.log(typeof(this.selectedGenreValue));
        console.log(this.selectedGenreValue.length);
         if(this.selectedGenreValue.length > 0){
            if (this.isChecked == true) {
                    this.allSelectedGenres = this.selectedGenreValue.join(';');
                    console.log('it is not null');
                        console.log('line 55 ',this.allSelectedGenres);
                        this.handleAsyncOperation()
                        .then((result) => {
                            console.log(result);
                            this.movieData = result;
 
                        })
                        .catch((error) => {
                            console.error('Error fetching movie genres:', error);
                        });
                } else {
                    this.allSelectedGenres = this.selectedGenreValue;
                    console.log('line 65 ', this.allSelectedGenres);
                }  
         }
        else{
            console.log('it is null');
            this.movieData = this.data;
        }
    }
 
   
    handleToggle(event){
this.isChecked = event.detail.checked;
console.log(this.isChecked);
//handleChange(e);
 
    }
 
    //async method to get response from apex controller
    // handleAsyncOperation() {
    //     return new Promise((resolve, reject) => {
    //         getSelectedGenresMovie({ selectedGenres: this.allSelectedGenres })
    //             .then((result) => {
    //                 this.movieByGenres = result;
    //                 resolve(this.movieByGenres);
    //             })
    //             .catch((error) => {
    //                 reject(error);
    //             });
    //     });
    // }
   
 
    //for search box
    handleSelectedMovie(event){
        this.selectedMovieId = event.detail.recordId;
        console.log(this.selectedMovieId);
        if (this.selectedMovieId != null) {
            this.showAllMovies = false;
            this.selectedMovieDetails = this.data.find(movie => movie.Id == this.selectedMovieId);
        console.log('Selected Movie Details:', this.selectedMovieDetails);
            console.log('Name:', this.selectedMovieDetails.Name);
            this.showSelectedMovie = true;
        }
        else{
            this.showSelectedMovie = false;
            this.showAllMovies = true;
            this.selectedMovieDetails = null;
        }
       
    }
 
//to get all movies data from apex
    @wire(getMovies)
    wiredGetMovies({data,error}){
        if (data) {
            console.log('this is data');
            console.log(data);
            console.log(typeof(this.movieData));
            console.log(data.length);
            this.data = data;
            this.movieData = data;
            console.log('from movieData ',this.movieData);
            console.log(typeof(this.movieData));
            console.log('Movie data length:', this.movieData.length);
        } else if (error) {
            console.error('Error loading movies:', error);
            // Handle the error appropriately, such as displaying an error message to the user.
        }
    }
   
 
}