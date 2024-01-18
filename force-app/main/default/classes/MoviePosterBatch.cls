global class MoviePosterBatch implements Database.Batchable<SObject>, Database.AllowsCallouts {

    global Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator('SELECT Id, TmdbId__c, Name FROM Movie__c');
    }

    global void execute(Database.BatchableContext BC, List<Movie__c> scope) {
        List<Movie__c> moviesToUpdate = new List<Movie__c>();
        String movieUrl = 'https://api.themoviedb.org/3/movie/';
        String apiKey = '42ee719896b25f8821890615eeabf17f';
        
        for (Movie__c movie : scope) {
            String apiUrl = movieUrl + movie.TmdbId__c + '?api_key=' + apiKey;
            System.debug(apiUrl);
        
            HttpRequest request = new HttpRequest();
            request.setEndpoint(apiUrl);
            request.setMethod('GET');
        
            Http http = new Http();
            HttpResponse response = http.send(request);
        
            if (response.getStatusCode() == 200) {
                Map<String, Object> jsonResponse = (Map<String, Object>)JSON.deserializeUntyped(response.getBody());
        
                if (jsonResponse != null && jsonResponse.get('poster_path') != null) {
                    String imageUrl = 'https://image.tmdb.org/t/p/original';
                    System.debug('Poster Path: ' + (String)jsonResponse.get('poster_path'));
        
                    movie.PosterUrl__c = imageUrl + (String)jsonResponse.get('poster_path');
                    moviesToUpdate.add(movie);
                } else {
                    System.debug('Error parsing API response for Movie Id: ' + movie.Id);
                }
            } else {
                System.debug('API Call failed for Movie Id: ' + movie.Id + '. Status Code: ' + response.getStatusCode());
            }
        }
        
        update moviesToUpdate;
        
    }
    global void finish(Database.BatchableContext BC) {
        String nextBatchClassName = 'ActorPosterBatch';
        Database.executeBatch((Database.Batchable<SObject>)Type.forName(nextBatchClassName).newInstance(), 5);
    }
    
}