import { StatusBar } from 'expo-status-bar';
import React, {useState} from 'react';
import { StyleSheet, View, TextInput, Button, Alert, Text } from 'react-native';
import Mapview, {Marker} from 'react-native-maps';

export default function App() {
  const [address, setAddress] = useState('');
  const [message, setMessage] = useState('');
  const [restaurants, setRestaurants] = useState([]);
  
  const [coordinates, setCoordinates] = useState({
    longitude: 24.9341868,
    latitude: 60.2016812,
    title: 'Haaga-Helian ammattikorkeakoulu'
  });

  const fetchData = async () => {
    const addressString = address.toLowerCase().replace(" ", "+");

    try{
      const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${addressString}&key=`);
      const data = await response.json();

      if(data.results.length > 0){
        const resultCoordinates = {
          longitude: data.results[0].geometry.location.lng,
          latitude: data.results[0].geometry.location.lat
        }

        setCoordinates({
          longitude: resultCoordinates.longitude,
          latitude: resultCoordinates.latitude,
          title: data.results[0].formatted_address
        });

        fetchRestaurants(resultCoordinates);
        setMessage('');
      } else {
        setMessage('The address was not found');
      }
    } catch(error){
      Alert.alert('Something went wrong, try again');
    }
  }

  const fetchRestaurants = async (resultCoordinates) => {
    try{
      const response = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${resultCoordinates.latitude},${resultCoordinates.longitude}&radius=1000&type=restaurant&key=`);
      const data = await response.json();
      setRestaurants(data.results);
    }catch(Error){
      Alert.alert("Problem encountered when searching for restaurants, try again later");
    }
  }

  return (
    <View style={styles.container}>
      <Mapview
        style={styles.mapView}
        region={{
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
          latitudeDelta: 0.0322,
          longitudeDelta: 0.0221
        }}>
        <Marker
          coordinate={{
            latitude: coordinates.latitude,
            longitude: coordinates.longitude
          }}
          title={coordinates.title} />
        {restaurants.map(restaurant => {
          return(
            <Marker
              key={restaurant.place_id}
              coordinate={{
                latitude: restaurant.geometry.location.lat,
                longitude: restaurant.geometry.location.lng
              }}
              title={restaurant.name}
              description={restaurant.vicinity}/>
          );
        })}
      </Mapview>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={address}
          onChangeText={address => setAddress(address)} />
        <Button onPress={fetchData} title='SHOW' />
        <View><Text style={{fontSize: 25}}>{message}</Text></View>
      </View>
      <StatusBar hidden={true} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  inputContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-around',
    paddingBottom: 10
  },

  mapView: {
    flex: 5,
    height: '100%',
    width: '100%'
  },

  textInput: {
    borderColor: 'black',
    borderWidth: 1,
    fontSize: 25,
    height: 35,
    paddingHorizontal:5,
    width: 250,
  }
});
