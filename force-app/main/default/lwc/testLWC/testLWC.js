import { LightningElement, track } from 'lwc';
import getMovies from '@salesforce/apex/MovieController.getAllMovies';
import getActors from '@salesforce/apex/MovieController.getAllActors';
import filteredMovies from '@salesforce/apex/MovieController.filteredMovies';

export default class TestLWC extends LightningElement {
    movies = [];
    actors = [];
    selectedMovieId = null;
    selectedActorId = null;
    isChecked = false;
    movieSelected = false;
    selectMovieData = {};
    selectActorData = {};
    selectedDecade;
    posterPath;
    name;

    connectedCallback() {
        getMovies()
            .then(result => {
                console.log(result);
                this.movies = result;
                console.log('Movies:', this.movies);
            })
            .catch(error => {
                console.error(error);
            });

        // Call the Apex method to get actors imperatively
        getActors()
            .then(result => {
                console.log(result);
                this.actors = result;
            })
            .catch(error => {
                console.error(error);
            });

    }

    loadMovies() {
        filteredMovies({ selectedDecade: this.selectedDecade })
            .then(result => {
                console.log(result);
                this.movies = result;
                console.log(this.movies);
            })
            .catch(error => {
                console.error(error);
            });
    }

    handleToggle(event) {
        console.log('came into handletoggle');
        this.isChecked = event.target.checked;
    }

    handleDecadeChange(event) {
        console.log('Inside Decade Change');
        this.selectedDecade = event.detail.value;
        this.loadMovies();
    }

    handleSelectedRecord(event) {
        const selectedRecordId = event.detail.recordId;
        this.movieSelected = true;
        console.log('>>>>>>>>>>..',selectedRecordId);
        console.log(this.movieSelected);
        const selectedMovie = this.movies.find(movie => movie.Id == selectedRecordId);
        console.log('Selected Movie:', selectedMovie);

        const selectedActor = this.actors.find(actor => actor.Id === selectedRecordId);
        console.log('Selected Actor:', selectedActor);

        if (selectedMovie) {
            console.log('Selected Movie Data:', selectedMovie);
            this.selectMovieData = selectedMovie;
            this.posterPath = this.selectMovieData.PosterUrl__c;
            this.name = this.selectMovieData.Name;
            console.log('Movie found in the array:', this.selectMovieData.PosterUrl__c);
        } else if (selectedActor) {
            console.log('Selected Actor Data:', selectedActor);
            this.selectActorData = selectedActor;
            this.posterPath = this.selectActorData.CastPosterPath__c;
            this.name = this.selectActorData.Name;
            console.log('Actor found in the array:', this.selectActorData.CastPosterPath__c);
        }
        else{
            this.movieSelected = false;
        }
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
