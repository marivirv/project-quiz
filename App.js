
import React, { useMemo, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Button, ButtonGroup, Card } from '@rneui/themed';

const Stack = createNativeStackNavigator();



const questionsData = [
  {
    prompt: 'Which planet is known as the Red Planet?',
    type: 'multiple-choice',
    choices: [
      'Mars',
      'Venus',
      'Jupiter',
      'Mercury',
    ],
    correct: 0,
  },
  {
    prompt: 'Select all prime numbers below.',
    type: 'multiple-answer',
    choices: [
      '2',
      '4',
      '5',
      '9',
    ],
    correct: [0, 2],
  },
  {
    prompt: 'The human body has 206 bones.',
    type: 'true-false',
    choices: [
      'False',
      'True',
    ],
    correct: 1,
  },
];

function checkAnswer(userAnswer, correctAnswer) {
  if (Array.isArray(correctAnswer)) {
    if (!Array.isArray(userAnswer)) return false;

    const sortedUser = [...userAnswer].sort((a, b) => a - b);
    const sortedCorrect = [...correctAnswer].sort((a, b) => a - b);

    if (sortedUser.length !== sortedCorrect.length) return false;

    for (let i = 0; i < sortedCorrect.length; i++) {
      if (sortedUser[i] !== sortedCorrect[i]) {
        return false;
      }
    }

    return true;
  }

  return userAnswer === correctAnswer;
}

function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.centerBox}>
        <Text style={styles.title}>Quiz App</Text>
        <Text style={styles.subtitle}>Press Start to Begin</Text>

        <Button
          title="Start Quiz"
          onPress={() =>
            navigation.replace('Question', {
              data: questionsData,
              index: 0,
              answers: [],
            })
          }
        />
      </View>
    </SafeAreaView>
  );
}

export function Question({ navigation, route }) {
  const { data, index, answers } = route.params;
  const question = data[index];

  const isMultipleAnswer = question.type === 'multiple-answer';

  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedIndexes, setSelectedIndexes] = useState([]);

  const canContinue = isMultipleAnswer
    ? selectedIndexes.length > 0
    : selectedIndex !== -1;

  const nextQuestion = () => {
    const updatedAnswers = [...answers];

    updatedAnswers[index] = isMultipleAnswer
      ? selectedIndexes
      : selectedIndex;

    const isLast = index === data.length - 1;

    if (isLast) {
      navigation.replace('Summary', {
        data,
        answers: updatedAnswers,
      });
    } else {
      navigation.replace('Question', {
        data,
        index: index + 1,
        answers: updatedAnswers,
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card>
          <Text style={styles.progress}>
            Question {index + 1} of {data.length}
          </Text>

          <Text style={styles.question}>
            {question.prompt}
          </Text>

          <Text style={styles.type}>
            {question.type}
          </Text>

          {isMultipleAnswer ? (
            <ButtonGroup
              testID="choices"
              buttons={question.choices}
              vertical
              selectMultiple
              selectedIndexes={selectedIndexes}
              onPress={(value) => setSelectedIndexes(value)}
              containerStyle={styles.group}
            />
          ) : (
            <ButtonGroup
              testID="choices"
              buttons={question.choices}
              vertical
              selectedIndex={selectedIndex}
              onPress={(value) => setSelectedIndex(value)}
              containerStyle={styles.group}
            />
          )}

          <Button
            testID="next-question"
            title={
              index === data.length - 1
                ? 'Finish Quiz'
                : 'Next Question'
            }
            onPress={nextQuestion}
            disabled={!canContinue}
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

export function Summary({ route }) {
  const { data, answers } = route.params;

  const total = useMemo(() => {
    let score = 0;

    data.forEach((question, i) => {
      if (checkAnswer(answers[i], question.correct)) {
        score += 1;
      }
    });

    return score;
  }, [data, answers]);

  const getStyle = (question, choiceIndex, userAnswer) => {
    const isCorrect = Array.isArray(question.correct)
      ? question.correct.includes(choiceIndex)
      : question.correct === choiceIndex;

    const isChosen = Array.isArray(userAnswer)
      ? userAnswer.includes(choiceIndex)
      : userAnswer === choiceIndex;

    if (isCorrect && isChosen) {
      return [styles.choice, styles.bold];
    }

    if (!isCorrect && isChosen) {
      return [styles.choice, styles.strike];
    }

    if (isCorrect) {
      return [styles.choice, styles.correct];
    }

    return styles.choice;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text testID="total" style={styles.total}>
          Total Score: {total} / {data.length}
        </Text>

        {data.map((question, i) => {
          const userAnswer = answers[i];
          const result = checkAnswer(userAnswer, question.correct);

          return (
            <Card key={i}>
              <Text style={styles.summaryQuestion}>
                {i + 1}. {question.prompt}
              </Text>

              <Text
                style={
                  result
                    ? styles.correctLabel
                    : styles.wrongLabel
                }
              >
                {result ? 'Correct' : 'Incorrect'}
              </Text>

              {question.choices.map((choice, choiceIndex) => (
                <Text
                  key={choiceIndex}
                  style={getStyle(question, choiceIndex, userAnswer)}
                >
                  • {choice}
                </Text>
              ))}
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          gestureEnabled: false,
          headerBackVisible: false,
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
        />
        <Stack.Screen
          name="Question"
          component={Question}
        />
        <Stack.Screen
          name="Summary"
          component={Summary}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F6',
  },

  centerBox: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },

  scroll: {
    padding: 16,
    paddingBottom: 30,
  },

  title: {
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
    color: '#C96A9B',
  },

  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: '#9C7A8B',
  },

  progress: {
    fontSize: 14,
    color: '#A98AA0',
    marginBottom: 10,
  },

  question: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 8,
    color: '#7A4E65',
  },

  type: {
    fontSize: 14,
    color: '#B28AA0',
    marginBottom: 15,
    textTransform: 'capitalize',
  },

  group: {
    marginBottom: 20,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },

  total: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
    color: '#C96A9B',
  },

  summaryQuestion: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#7A4E65',
  },

  correctLabel: {
    color: '#6FA87B',
    fontWeight: '700',
    marginBottom: 10,
  },

  wrongLabel: {
    color: '#D96C89',
    fontWeight: '700',
    marginBottom: 10,
  },

  choice: {
    fontSize: 15,
    marginBottom: 6,
    color: '#5C4A54',
  },

  bold: {
    fontWeight: '700',
    color: '#C96A9B',
  },

  strike: {
    textDecorationLine: 'line-through',
    color: '#C9A7B7',
  },

  correct: {
    fontStyle: 'italic',
    color: '#6FA87B',
  },
});