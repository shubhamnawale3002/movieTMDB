import { LightningElement, track, wire } from 'lwc';
import getMovies from '@salesforce/apex/MovieController.getAllMovies';
import { getPicklistValues } from 'lightning/uiObjectInfoApi';
import MOVIE_GENRE_FIELD from '@salesforce/schema/Movie__c.Movie_Genre__c';
import filteredMoviesByDecade from '@salesforce/apex/MovieController.filteredMoviesByDecade';
import filteredMoviesByGenres from "@salesforce/apex/MovieController.filteredMoviesByGenres";
import getMovieByGenre from "@salesforce/apex/MovieController.getMoviesByGenres";
import performSOSLQuery from '@salesforce/apex/MovieController.performSOSL';


export default class TestLWC extends LightningElement {
    @track activeAccordionSection;
    movies = [];
    actors = [];
    selectedDecade;
    genrePicklistvalues;
    genreCondition = 'Or';
    selectedGenreValue = [];
    filterByGenres = null;
    filterByDecade = null;
    allMovies =[];
    showAllMovies = false;
    searchMovies =[];
    searchedMovies= null;
    connectedCallback() {
        this.fetchMovies();
    }
    fetchMovies() {
        this.showAllMovies = true;
        getMovies()
            .then(result => {
                this.movies = result;
            })
            .catch(error => {
                console.error(error);
            });
        }     
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
        if (data) {
            this.genrePicklistvalues = data.values.map(item => ({
                label: item.label,
                value: item.value
            }));
        } else if (error) {
            console.error('Error fetching genre options:', error);
        }
    }

    handleConditionChange(event) {
        this.genreCondition = event.detail.value;
    }
    
    handleGenreChange(event) {
        this.selectedGenreValue = event.detail.value;
        this.activeAccordionSection = 'genresSection';
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

    handleDecadeChange(event) {
        this.selectedDecade = event.detail.value;
        this.activeAccordionSection = 'decadeSection';
        this.loadMovies();   
    }

    loadMovies() {
        this.showAllMovies = false;
        filteredMoviesByDecade({ selectedDecade: this.selectedDecade })
            .then(result => {
                this.filterByDecade = result;
                console.log('this.filterByDecade ',this.filterByDecade);
            })
            .catch(error => {
                console.error(error);
            });

        if (this.selectedDecade === '-1') {
            getMovies()
                .then(result => {
                    this.showAllMovies = true;
                    this.allMovies = result;
                })
                .catch(error => {
                    console.error(error);
                });
        } 
    }

    get generateDecadeOptions() {
        let decadeOptions = [
            { label: 'Select Decade', value: '-1' }
        ];
        for (let i = 1940; i <= 2009; i += 10) {
            let startYear = i;
            let endYear = i + 9;
            let label = `${startYear}-${endYear}`;
            let value = `${startYear}-${endYear}`;
            decadeOptions.push({ label, value });
        }
        return decadeOptions;
    }
   
    searchTerm = '';
    handleSearchTermChange(event) {
        this.searchTerm = event.target.value;
        if(!this.searchTerm){
            this.showAllMovies = true;
        }else{
            this.showAllMovies = false;
        }
    }
    handleKeyPress(event) {
        if (event.key === "Enter") {
            this.handleSearch();
        }
    }
    handleSearch() {
        if (this.searchTerm) {
            const soslQuery = `${this.searchTerm}`;
            performSOSLQuery({ soslQuery })
                .then(result => {
                    
                    this.searchMovies = result;
                    this.searchedMovies = [];
                    this.searchMovies.forEach(record => {
                        if (record.Movie__r) {
                            this.searchedMovies.push({
                                Name: record.Movie__r.Name,
                                PosterUrl: record.Movie__r.PosterUrl__c,
                                ReleaseDate: record.Movie__r.Release_Date__c,
                            });
                        }
                        else{
                            this.searchedMovies.push({
                                Id: record.Id,
                                Name: record.Name,
                                PosterUrl: record.PosterUrl__c,
                                ReleaseDate: record.Release_Date__c,
                            });
                        }
                    });
                })
                .catch(error => {
                    console.error('Error performing SOSL query:', error);
                });
        }
    }
}