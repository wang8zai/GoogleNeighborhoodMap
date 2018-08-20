# GoogleNeighborhoodMap
Google NeighborhoodMap

## Project Overall Explaination
What does this web do?
1. Use google java script api to locate your position.
2. Display the places around you within a radius of a given value by user.
3. You can use filter to get the related places you want.
4. Also can use type to specify which kind of place you want to find. Restaurant, bar or something else.
5. click the marker will display infowindow showing the name of place. If not found in foursquare, display not found.
6. Left view list array will show all the places searched from google api. Once hover on the name, the marker will bounce.
7. Once clicked on the name, the info will show in the view list left bar.

## Description
Develop a single page application featuring a map of your neighborhood or a neighborhood you would like to visit. Add functionality to this map including highlighted locations, third-party data about those locations and various ways to browse the content.

## Dependency
1. javascript
2. html
3. css
4. google javascript api
5. knockout.js
6. map-icons

## Installation
1. clone to local. clone https://github.com/wang8zai/GoogleNeighborhoodMap
2. open index.html.

## Explaination
1. What 3rd party used?
Foursquare.
2. Where?
In MVVM.js line 135 send request to foursquare search.
data bind to index.html line 65.
3. Overall.
Have a view model to record a view list model and a searching parameter model.
View list model record each element. Each element record the marker, infowindow displaying the infomation in of the place and detail retrieved from foursquare. 
Searching parameter model record the input value from the user. Used to send request to foursqure.
4. Shame.
Used detail search in foursquare before but premimum request cost is expensive. So only used the regular requesets.

