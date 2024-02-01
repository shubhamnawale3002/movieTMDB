public with sharing class MovieController {
    @AuraEnabled(cacheable=true)
    public static List<Movie__c> getAllMovies() {
        return [SELECT Id,TmdbId__c, Name, Release_Date__c,Movie_Genre__c,Tagline__c,PosterUrl__c FROM Movie__c];
    }
    @AuraEnabled(cacheable=true)
    public static List<Movie__c> filteredMoviesByDecade(String selectedDecade) {
            Integer startYear = Integer.valueOf(selectedDecade.split('-')[0]);
            Integer endYear = Integer.valueOf(selectedDecade.split('-')[1]);
            return [SELECT Id,Release_Date__c, Name, Tagline__c,TmdbId__c,Movie_Genre__c,PosterUrl__c 
                    FROM Movie__c
                    WHERE CALENDAR_YEAR(Release_Date__c) >= :startYear AND CALENDAR_YEAR(Release_Date__c) <= :endYear];        
    }
    @AuraEnabled(cacheable=true)
    public static List<Movie__c> getMoviesByGenres(String selectedGenres){
        return ([Select Id, Name, TmdbId__c, PosterUrl__c,
                 Release_Date__c, Movie_Genre__c from Movie__c
                 where Movie_Genre__c includes (:selectedgenres)]);
    }
    @AuraEnabled(cacheable=true)
public static List<Movie__c> filteredMoviesByGenres(String selectedGenres) {
    //String str = 'History;Adventure';
    List<String> genresList = selectedGenres.split(';');
    Set<Movie__c> uniqueMoviesSet = new Set<Movie__c>();

    for (String genre : genresList) {
        List<Movie__c> movies = getMoviesByGenres(genre);
        uniqueMoviesSet.addAll(movies);
    }

    List<Movie__c> uniqueMoviesList = new List<Movie__c>(uniqueMoviesSet);

    for (Movie__c movie : uniqueMoviesList) {
        System.debug(movie);
    }
    return uniqueMoviesList;
}
@AuraEnabled(cacheable=true)
    public static List<SObject> performSOSL(String soslQuery) {
        List<List<SObject>> searchResults = Search.query('FIND \'' + soslQuery + '\' IN Name FIELDS RETURNING Movie__c (Id), Actor__c (Id)');
        List<Movie__c> moviedata = new List<Movie__c>();
        List<String> actordata = new List<String>();
        if (searchResults[0].size() > 0) {
            moviedata = (List<Movie__c>)searchResults[0];
            List<Movie__c> moviesWithCastMembers = [SELECT Id, Name, PosterUrl__c,release_date__c FROM Movie__c WHERE Id IN :moviedata];
            return moviesWithCastMembers;
        } else if (searchResults[1].size() > 0){
            actordata = new List<String>();
            //searchResults[1] = (Actor__c:{Id=a025g00000NQ30OAAT})
            for (SObject actor : searchResults[1]) {
                actordata.add(String.valueOf(actor.get('Id')));
            }
            List<CastMembers__c> actorsWithCastMembers = [SELECT Movie__r.Id,movie__r.PosterUrl__c,movie__r.name,movie__r.release_date__c FROM CastMembers__c WHERE Actor__r.Id IN :actordata];
            return actorsWithCastMembers;     
        }
        return null;
    }
    
}