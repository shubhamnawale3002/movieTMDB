public class movieParsing {
    static List<Movie__c> movieRecords = new List<Movie__c>();
    static List<Actor__c> actorRecords = new List<Actor__c>();
    static List<CastMembers__c> castMembersRecords = new List<CastMembers__c>();

    public class Movie {
        public String tmdbId;
        public String originalLanguage;
        public String title;
        public String overview;
        public String posterUrl;
        public String releaseDate;
        public Integer runtimeMinutes;
        public String status;
        public String tagline;
        public List<Genre> genres;
        public List<CastMember> castMembers;

        public Movie() {
            genres = new List<Genre>();
            castMembers = new List<CastMember>();
        }
    }

    public class CastMember {
        public String castId;
        public String character;
        public String creditId;
        public Integer gender;
        public String id;
        public String name;
        public Integer order;
        public String profilePath;
    }

    public class Genre {
        public String name;
    }
    public static void insertRecords() {
        List<ContentVersion> contentVersions = [SELECT ContentDocumentId FROM ContentVersion LIMIT 1];
        String jsonFileId = contentVersions[0].ContentDocumentId;
        parseAndInsertMovie(jsonFileId);
    }
    public static void parseAndInsertMovie(String fileId) {
        ContentVersion fileContent = [SELECT Id, VersionData FROM ContentVersion WHERE ContentDocumentId = :fileId];
        String jsonString = fileContent.VersionData.toString();
        List<Movie> movies = (List<Movie>) JSON.deserialize(jsonString, List<Movie>.class);

        if (movies != null && !movies.isEmpty()) {
            for (Movie movieData : movies) {
                Movie__c movieRecord = new Movie__c(
                    TmdbId__c = movieData.tmdbId,
                    Name = movieData.title,
                    Overview__c = movieData.overview,
                    Release_Date__c = Date.valueOf(movieData.releaseDate),
                    Runtime_Minutes__c = movieData.runtimeMinutes,
                    Genres__c = getGenresAsString(movieData.genres),
                    Tagline__c = movieData.tagline
                );

                movieRecords.add(movieRecord);

                if (movieData.castMembers != null && !movieData.castMembers.isEmpty()) {
                    for (CastMember castMember : movieData.castMembers) {
                        Actor__c existingActor = findExistingActor(castMember.name);

                        if (existingActor == null) {
                            Actor__c actorRecord = new Actor__c(
                                Actor_ID__c = castMember.id,
                                Name = castMember.name
                            );

                            actorRecords.add(actorRecord);
                        } else {
                            if (!actorRecords.contains(existingActor)) {
                                actorRecords.add(existingActor);
                            }
                        }
                    }
                } else {
                    System.debug('No cast members found for movie: ' + movieData.title);
                }
            }

            if (!movieRecords.isEmpty()) {
                insert movieRecords;

                Map<String, Id> movieIdMap = new Map<String, Id>();
                for (Movie__c movie : movieRecords) {
                    movieIdMap.put(movie.Name, movie.Id);
                }

                if (!actorRecords.isEmpty()) {
                    insert actorRecords;

                    Map<String, Id> actorIdMap = new Map<String, Id>();
                    for (Actor__c actor : actorRecords) {
                        actorIdMap.put(actor.Name, actor.Id);
                    }

                    for (Movie movieData : movies) {
                        if (movieData.castMembers != null && !movieData.castMembers.isEmpty()) {
                            for (CastMember castMember : movieData.castMembers) {
                                CastMembers__c castMemberRecord = new CastMembers__c(
                                    Movie__c = movieIdMap.get(movieData.title),
                                    Actor__c = actorIdMap.get(castMember.name),
                                    CastName__c = castMember.character,
                                    Cast_Id__c = castMember.castId
                                );

                                castMembersRecords.add(castMemberRecord);
                            }
                        }
                    }

                    if (!castMembersRecords.isEmpty()) {
                        insert castMembersRecords;
                    } else {
                        System.debug('No castMembers records to insert.');
                    }
                } else {
                    System.debug('No actor records to insert.');
                }
            } else {
                System.debug('No movie records to insert.');
            }
        } else {
            System.debug('No movies found in the list.');
        }

        Database.executeBatch(new MoviePosterBatch(), 200);
    }

    private static Actor__c findExistingActor(String actorName) {
        for (Actor__c existingActor : actorRecords) {
            if (existingActor.name.equals(actorName)) {
                return existingActor;
            }
        }
        return null;
    }

    private static String getGenresAsString(List<Genre> genres) {
        if (genres != null && !genres.isEmpty()) {
            List<String> genreNames = new List<String>();
            for (Genre genre : genres) {
                genreNames.add(genre.name);
            }
            return String.join(genreNames, ';');
        }
        return null;
    }
}