
movieParsing.insertRecords();

List<Movie__c> moviesToDelete = [SELECT Id FROM Movie__c];
delete moviesToDelete;

List<Actor__c> moviesToDelete1 = [SELECT Id FROM Actor__c];
delete moviesToDelete1;

Database.executeBatch(new MoviePosterBatch(), 200);
Database.executeBatch(new ActorPosterBatch(), 50);


test123 updater = new test123();
updater.updateActorNames();
test123.updateActorNames();

test.test2('a025g00000NQ30OAAT');