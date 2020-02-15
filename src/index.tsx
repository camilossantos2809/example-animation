import React from "react";
import { Dimensions, TouchableOpacity, Text, StyleSheet } from "react-native";
import { PanGestureHandler, State } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { timing, opacity } from "react-native-redash";

const {
  View,
  ScrollView,
  Value,
  Extrapolate,
  interpolate,
  add,
  sub,
  multiply,
  event,
  useCode,
  cond,
  eq,
  set
} = Animated;
const { width: windowWidth, height: windowHeight } = Dimensions.get("window");
const CARD_PADDING = 50;
const CARD_WIDTH = windowWidth - CARD_PADDING * 2;

export const Carousel: React.FC = () => {
  const offsetX = new Value(0);
  const carouselOpacity = new Value(1);
  const animationState = new Value(1);

  const toggle = () => {
    return animationState.setValue(cond(eq(animationState, 0), 1));
  };

  useCode(
    set(
      carouselOpacity,
      timing({
        from: carouselOpacity,
        to: animationState,
        duration: 500
      })
    ),
    [animationState]
  );

  return (
    <React.Fragment>
      <ScrollView
        horizontal
        snapToAlignment="start"
        decelerationRate="fast"
        snapToInterval={CARD_WIDTH}
        style={{ paddingVertical: 50, opacity: carouselOpacity }}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: CARD_PADDING }}
        scrollEventThrottle={1}
        onScroll={Animated.event([
          {
            nativeEvent: {
              contentOffset: {
                x: offsetX
              }
            }
          }
        ])}
      >
        {Array.from({ length: 10 }).map((card, index) => (
          <View
            key={index}
            style={{
              flex: 1,
              width: CARD_WIDTH,
              borderWidth: 1,
              borderColor: "red",
              backgroundColor: "lightgreen",
              opacity: interpolate(offsetX, {
                inputRange: [
                  multiply(sub(index, 1), CARD_WIDTH),
                  multiply(index, CARD_WIDTH),
                  multiply(add(index, 1), CARD_WIDTH)
                ],
                outputRange: [0.5, 1, 0.5]
              }),
              transform: [
                {
                  scale: interpolate(offsetX, {
                    inputRange: [
                      multiply(sub(index, 1), CARD_WIDTH),
                      multiply(index, CARD_WIDTH),
                      multiply(add(index, 1), CARD_WIDTH)
                    ],
                    outputRange: [0.9, 1, 0.9]
                  })
                }
              ]
            }}
          />
        ))}
      </ScrollView>
      <TouchableOpacity
        onPress={toggle}
        style={{
          paddingVertical: 20,
          paddingHorizontal: 30,
          position: "absolute",
          bottom: 100,
          alignSelf: "center",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "orangered"
        }}
      >
        <Text style={{ fontSize: 18, color: "white", fontWeight: "bold" }}>
          Toggle
        </Text>
      </TouchableOpacity>
    </React.Fragment>
  );
};

const ExamplePan = () => {
  // Posição em que o usuário está "arrastando" a view
  const dragX = new Value(0);
  const dragY = new Value(0);
  // Posição final para onde o objeto foi movido
  const offsetX = new Value(windowWidth / 2);
  const offsetY = new Value(windowHeight / 2);
  // Estado atual do evento (ativo, etc)
  const gestureState = new Value(-1);
  // Objeto responsável por mapear o evento disparado por PanGestureHandler
  const onGestureEvent = event([
    {
      nativeEvent: {
        translationX: dragX,
        translationY: dragY,
        state: gestureState
      }
    }
  ]);
  // Objeto que será passado para o style do componente com o valor capturado do evento da animação
  const transX = cond(
    eq(gestureState, State.ACTIVE), // Verifica se o evento foi iniciado
    add(offsetX, dragX), // Valor do style atualizado apenas durante a movimentação
    set(offsetX, add(offsetX, dragX)) // Grava efetivamente a última posição do objeto
  );
  const transY = cond(
    eq(gestureState, State.ACTIVE), // Verifica se o evento foi iniciado
    add(offsetY, dragY), // Valor do style atualizado apenas durante a movimentação
    set(offsetY, add(offsetY, dragY)) // Grava efetivamente a última posição do objeto
  );

  const scaleY = interpolate(transY, {
    inputRange: [0, windowHeight],
    outputRange: [0, 2],
    extrapolate: Extrapolate.CLAMP
  });
  const scaleX = interpolate(transY, {
    inputRange: [0, windowWidth],
    outputRange: [0, 2],
    extrapolate: Extrapolate.CLAMP
  });

  return (
    <View style={styles.container}>
      <PanGestureHandler
        maxPointers={1}
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onGestureEvent}
      >
        <Animated.View
          style={[
            styles.box,
            {
              transform: [
                {
                  translateX: transX,
                  translateY: transY,
                  scaleX: scaleX,
                  scaleY: scaleY
                }
              ]
            }
          ]}
        />
      </PanGestureHandler>
    </View>
  );
};

const CIRCLE_SIZE = 70;
const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  box: {
    backgroundColor: "tomato",
    marginLeft: -(CIRCLE_SIZE / 2),
    marginTop: -(CIRCLE_SIZE / 2),
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    borderColor: "#000"
  }
});

export default ExamplePan;

// https://medium.com/@kauedm/react-native-reanimated-um-guia-pr%C3%A1tico-cbd16465b0b8
// https://www.youtube.com/watch?v=_5-6xVmcIUA
// https://codedaily.io/courses/7/React-Native-Reanimated-Fundamentals/133
