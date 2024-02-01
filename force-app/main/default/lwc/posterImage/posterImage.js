import { LightningElement, wire } from "lwc";
import getMovies from "@salesforce/apex/TestMovieLwcController.getMovies";
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import MOVIE_GENRE_FIELD from '@salesforce/schema/Movie__c.Genre__c';
import getSelectedGenresMovie from "@salesforce/apex/TestMovieLwcController.getSelectedGenresMovie";
import getMovieByGenre from "@salesforce/apex/TestMovieLwcController.getMovieByGenre";
import getSelectedDecadeMovie from "@salesforce/apex/TestMovieLwcController.getSelectedDecadeMovie";
import getSelectedActorMovies from "@salesforce/apex/TestMovieLwcController.getSelectedActorMovies";

export default class TestMovieLwc extends LightningElement {
    data = [];
    movieData = [];
    moviesByGenres = [];
    selectedDecade = '';
    moviesByDecade = [];
    selectedMovieId = null;
    selectedMovieDetails = null;
    showSelectedMovie = false;
    showAllMovies = true;
    genrePicklistvalues;
    //toggleInput = false;
    selectedDecadeMovies = [];
    movieByGenres = [] ;
    showDropdown = true;
   // selectedGenreValue =[];
   selectedGenreValue= [];
    allSelectedGenres;

    @wire(getPicklistValues, {
        recordTypeId: '012000000000000AAA', // "Master" RecordTypeId of service type
        fieldApiName: MOVIE_GENRE_FIELD
    })
    wiredGenreOptions({ error, data }) {
        if (data) {
            console.log('genre from data',data);
            this.genrePicklistvalues = data.values.map(item => ({
                label: item.label,
                value: item.value
            }));
        }
        
    }
    
    movieDisplayInfo = {
        additionalFields: ['TmdbId__c']
    }

    movieMatchingInfo = {
        primaryField: { fieldPath: 'Name' },
        additionalFields: [ { fieldPath: 'TmdbId__c' } ]
    }

    // actorDisplayInfo = {
    //     additionalFields: ['TmdbId__c']
    // }

    // actorMatchingInfo = {
    //     primaryField: { fieldPath: 'Name' },
    //     additionalFields: [ { fieldPath: 'Name' } ]
    // }
    
    get selectedValues() {
        return this.selectedGenreValue.join(';');
    }

    get decadeOptions() {
        return [
            { label: 'Not selected', value: 'null' },
            { label: '1950s', value: '1950' },
            { label: '1960s', value: '1960' },
            { label: '1970s', value: '1970' },
            { label: '1980s', value: '1980' },
            { label: '1990s', value: '1990' },
            { label: '2000s', value: '2000' },
            { label: '2010s', value: '2010' },
            { label: '2020s', value: '2020' },
        ];
    }

    //to get all movies data from apex
    @wire(getMovies)
    wiredGetMovies({data,error}){
        if (data) {
            console.log(typeof(this.movieData));
            console.log(data.length);
            this.data = data;
            this.movieData = data;
            console.log('from movieData ',this.movieData);
        } else if (error) {
            console.error('Error loading movies:', error);
        }
    }

    handleGenreChange(e) {
        console.log(' 95  genre from genrepicklistvalue',this.genrePicklistvalues);
        this.selectedGenreValue = e.detail.value;
        console.log('inside handle genres change ',this.selectedGenreValue);
         if(this.selectedGenreValue.length > 0){
                this.allSelectedGenres = this.selectedGenreValue.join(';');
                    console.log(this.allSelectedGenres);
                    this.handleAsyncOperation()
                    .then((result) => {
                        console.log(result);
                        this.movieData = result;
                    })
                    .catch((error) => {
                        console.error('Error fetching movie genres:', error);
                    });  
         }
        else{
            console.log('it is null');
            this.movieData = this.data;
        }
    }

    //async method to get response from apex controller
    handleAsyncOperation() {
        if(this.genreCondition == 'And'){
            return new Promise((resolve, reject) => {
                getSelectedGenresMovie({ selectedGenres: this.allSelectedGenres })
                    .then((result) => {
                        this.movieByGenres = result;
                        resolve(this.movieByGenres);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        }
        else if(this.genreCondition == 'Or'){
            return new Promise((resolve, reject) => {
                getMovieByGenre({ selectedGenres: this.allSelectedGenres })
                    .then((result) => {
                        this.movieByGenres = result;
                        resolve(this.movieByGenres);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            });
        }
    }
    

    //for search box
    handleSelectedMovie(event){
        this.selectedMovieId = event.detail.recordId;
        console.log(this.selectedMovieId);
        if (this.selectedMovieId != null) {
            this.showAllMovies = false;
            this.selectedMovieDetails = this.data.find(movie => movie.Id == this.selectedMovieId);
            console.log('Name:', this.selectedMovieDetails.Name);
            this.showSelectedMovie = true;
        }
        else{
            this.showSelectedMovie = false;
            this.showAllMovies = true;
            this.selectedMovieDetails = null;
        }
        
    }
  



    handleDecadeChange(event) {
        this.selectedDecade = event.detail.value;
        console.log(typeof(this.selectedDecade),this.selectedDecade);
        if(this.selectedDecade != 'null'){
            this.AsyncDecadeFunction()
            .then((result) => {
                console.log(result);
                this.movieData = result;
            })
            .catch((error) => {
                console.error('Error fetching movie genres:', error);
            });
        }
        else{
            this.movieData = this.data;
        }  
    }
    AsyncDecadeFunction() {
        return new Promise((resolve, reject) => {
            getSelectedDecadeMovie({ selectedDecade: this.selectedDecade })
                .then((result) => {
                    this.movieByDecade = result;
                    resolve(this.movieByDecade);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }
    genreCondition = 'Or';
    get options() {
        return [
            { label: 'AND', value: 'And' },
            { label: 'OR', value: 'Or' },
        ];
    }

    handleConditionChange(event){
        this.genreCondition = event.detail.value;
        console.log(this.genreCondition);
    }

    filterMovies(){
    }

    selectedActorId = null;
    movieByActor;
    actorName;
    actorProfile;
    handleSelectedActor(event){
        console.log('before selection ',this.selectedActorId);
        this.selectedActorId =event.detail.recordId;
        if(this.selectedActorId != null){
            console.log(this.selectedActorId);
            this.asyncSelectedActor()
            .then((result) => {
                console.log(result);
                this.movieData = result;
                console.log(this.movieData[0].ActorName);
                this.actorName = this.movieData[0].ActorName;
                this.actorProfile = this.movieData[0].ActorProfile;
            })
            .catch((error) => {
                console.error('Error fetching movie by Actor:', error);
            });
        }else{
            console.log('inside else condition');
            this.movieData = this.data;
        }
    }
    asyncSelectedActor() {
        return new Promise((resolve, reject) => {
            getSelectedActorMovies({ selectedActor: this.selectedActorId })
                .then((result) => {
                    this.movieByActor = result;
                    resolve(this.movieByActor);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }
    newVariable;
    RemoveVal;
    handleRemove(event){
        this.RemoveVal = event.target.value;
        console.log('this is rem val ',this.RemoveVal);
        console.log('inside handle remove');
        console.log();
        event.preventDefault();
        //information of splice parameter ie; splice(from index,no of index to remove)
        this.newVariable = this.selectedGenreValue.splice(this.RemoveVal ,1);
        this.selectedGenreValue = [...this.selectedGenreValue];
        console.log('this selected genre array',this.selectedGenreValue);
        console.log('line 251',JSON.stringify(this.newVariable));
        
    }
    

}