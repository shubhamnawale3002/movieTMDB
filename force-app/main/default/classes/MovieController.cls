public with sharing class MovieController {
    @AuraEnabled(cacheable=true)
    public static List<Movie__c> getAllMovies() {
        return [SELECT Id,TmdbId__c, Name, Release_Date__c,genres__c,Tagline__c,PosterUrl__c FROM Movie__c];
    }
    @AuraEnabled(cacheable=true)
    public static List<Actor__c> getAllActors() {
        return [SELECT Id,Name,CastPosterPath__c FROM Actor__c];
    }
    @AuraEnabled(cacheable=true)
    public static List<Movie__c> filteredMovies(String selectedDecade) {
        try {
            // Convert the input string to integer (decade year)
            Integer startYear = Integer.valueOf(selectedDecade.split('-')[0]);
            Integer endYear = Integer.valueOf(selectedDecade.split('-')[1]);
   
            // Query movies where the year part of Release_del__c falls within the selected decade
            return [SELECT Id,Release_Date__c, Name, Tagline__c,TmdbId__c,genres__c,PosterUrl__c
                    FROM Movie__c
                    WHERE CALENDAR_YEAR(Release_Date__c) >= :startYear AND CALENDAR_YEAR(Release_Date__c) <= :endYear];
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}
