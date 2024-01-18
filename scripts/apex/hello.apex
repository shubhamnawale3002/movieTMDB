
movieParsing.insertRecords();

List<Movie__c> moviesToDelete = [SELECT Id FROM Movie__c];
delete moviesToDelete;

List<Actor__c> moviesToDelete1 = [SELECT Id FROM Actor__c];
delete moviesToDelete1;

Database.executeBatch(new MoviePosterBatch(), 200);
Database.executeBatch(new ActorPosterBatch(), 50);
