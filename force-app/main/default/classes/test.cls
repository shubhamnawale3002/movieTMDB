public with sharing class test {
    @AuraEnabled(cacheable=true)
    public static List<String> test1(String soslQuery) {
        List<List<SObject>> searchResults = Search.query('FIND \'' + soslQuery + '\' IN Name FIELDS RETURNING Movie__c (Id), Actor__c (Id)');
        List<Movie__c> moviedata = new List<Movie__c>();
        List<Actor__c> actordata = new List<Actor__c>();
        List<String> movieIds = new List<String>();


            moviedata = (List<Movie__c>)searchResults[0];
            List<Movie__c> moviesWithCastMembers = [SELECT Id, Name, PosterUrl__c FROM Movie__c WHERE Id IN :moviedata];
            
            for (Movie__c movie : moviesWithCastMembers) {
                movieIds.add(movie.Id);
            }

            actordata = (List<Actor__c>)searchResults[1];
            List<CastMembers__c> actorsWithCastMembers = [SELECT Movie__r.Id FROM CastMembers__c WHERE Actor__r.Id IN :actordata];
            
            for (CastMembers__c castMember : actorsWithCastMembers) {
                movieIds.add(castMember.Movie__r.Id);
            }

        return movieIds;
    }
}
