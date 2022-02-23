import Immutable from "immutable"

export enum Gender {
  Male = 'male',
  Female = 'female',
  Diverse = 'diverse'
}

export var article = Immutable.Map<Gender, string>({
  [Gender.Male]: 'der',
  [Gender.Female]: 'die',
  [Gender.Diverse]: 'das'
})

export var personalPronoun = Immutable.Map<Gender, string>({
  [Gender.Male]: 'er',
  [Gender.Female]: 'sie',
  [Gender.Diverse]: 'es'
})

export var possessivePronoun = Immutable.Map<Gender, string>({
  [Gender.Male]: 'sein',
  [Gender.Female]: 'ihr',
  [Gender.Diverse]: 'sein'
})

export var participantNoun = Immutable.Map<Gender, string>({
  [Gender.Male]: 'Teilnehmer',
  [Gender.Female]: 'Teilnehmerin',
  [Gender.Diverse]: 'Teilnehmer'
})

export var winnerNoun = Immutable.Map<Gender, string>({
  [Gender.Male]: 'Gewinner',
  [Gender.Female]: 'Gewinnerin',
  [Gender.Diverse]: 'Gewinner'
})