global class ActorPosterBatch implements Database.Batchable<SObject>, Database.AllowsCallouts {
 
    global Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator('SELECT Id, Actor_ID__c, Name FROM Actor__c ');
    }
 
    global void execute(Database.BatchableContext BC, List<Actor__c> scope) {
        List<Actor__c> actorsToUpdate = new List<Actor__c>();
        String actorUrl = 'https://api.themoviedb.org/3/person/';
        String apiKey = '42ee719896b25f8821890615eeabf17f';
        Integer i = 1;
 
        for (Actor__c actor : scope) {
            String apiUrl = actorUrl + actor.Actor_ID__c + '?api_key=' + apiKey;
           
            HttpRequest request = new HttpRequest();
            request.setEndpoint(apiUrl);
            request.setMethod('GET');
 
            Http http = new Http();
            HttpResponse response = http.send(request);
 
            if (response.getStatusCode() == 200) {
                Map<String, Object> jsonResponse = (Map<String, Object>) JSON.deserializeUntyped(response.getBody());
 
                if (jsonResponse != null && jsonResponse.get('profile_path') != null) {
                    String imageUrl = 'https://image.tmdb.org/t/p/original';
                    actor.CastPosterPath__c = imageUrl + (String)jsonResponse.get('profile_path');
                    i++;
                    System.debug(i + ' ' + actor.CastPosterPath__c);
                    actorsToUpdate.add(actor);
                } else {
                    System.debug('Error parsing API response for Actor Id: ' + actor.Id);
                }
            } else {
                System.debug('API Call failed for Actor Id: ' + actor.Id + '. Status Code: ' + response.getStatusCode());
            }
        }
        System.debug(actorsToUpdate);
        update actorsToUpdate;
    }
 
    global void finish(Database.BatchableContext BC) {
        // Perform any post-processing logic here
    }
}