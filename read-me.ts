/**
 * KerPlunk: https://en.wikipedia.org/wiki/KerPlunk_%28game%29
 *
 * KerPlunk is a game where you hold up marbles with sticks
 *  and then take turn taking out sticks without letting the marbles through.
 * The person who lets the most marbles through loses.
 *
 * A similar problem exists in software engineering where,
 *  in the process of implementing business logic, you may end up creating a nest of if-thens
 *  which is hard to reason about and verify its correctness.
 *
 * Although this problem doesn't overlap with traditional computer science fields of study,
 *  this problem has a lot of in common with them.
 *
 * Prolog: https://en.wikipedia.org/wiki/Prolog
 *
 * A notable prior art in this area is the Prolog programming language. It was originally invented as an AI system
 *  whereby programmers to encode "real world" information by programming in the language, and then when
 *  a sufficient amount of knowledge had been programmed the program would exhibit general-level intelligence.
 *
 * Prolog didn't (or at least hasn't yet) turned out to be the solution to AI, but it's ideas are useful for
 *  solving other problems; namely this one.
 *
 * Although it might seem obvious now in the current age of neural networks (such as GPT-4),
 *  a way of representing knowledge can be a graph (aka a network).
 * Often times, facts are not as important as how the facts relate to each other.
 * For example, knowing a person's name is useful but knowing their relationships to you and other people in your life
 *  is more valuable then just knowing a person's name in isolation.
 * Another example is mechanical engineering, knowing individual physics laws is useful but understand how to
 *  connect those laws together to build bridges is argubly more valuable.
 *
 * Metcalfe's law: https://en.wikipedia.org/wiki/Metcalfe%27s_law.
 *
 * SnapChat proposed sell for 3 billion dollars:
 *  https://www.newyorker.com/tech/annals-of-technology/why-did-snapchat-turn-down-three-billion-dollars.
 *
 * This is the basis of Metcalfe's law, and the reason why a social network can be sold for 3 billion dollars.
 * Indiviual facts combined are greater than the sum of their parts, and it is often the case in the "real world"
 *  that we care more about and derive more value from the connections than the nodes.
 *
 * Prolog was essentially a programming language for creating a graph
 *  (or network if you will) of all of human knowledge.
 * Its propose solution to AI was that it was simply a search on this graph.
 * An idea that was floating around the time the first neural network was invented as well.
 *
 * This is all a long way to say that the If-Then KerPlunk problem is really a graph traversal problem.
 * A series of If-Then's is actually a flowchart which is actually a state machine.
 * Indeed, if you remember programming 101, one of the first tools given to new learners is the flowchart
 *  for mapping out algorithms before they are implemented.
 *
 * So then do we need to break out the graph and graph traversal algorithms?
 *
 * You can if you want! But I propose a simpler solution: monads.
 *
 * Monad: A monad is just a monoid in the category of endofunctors, what's the problem?
 *
 * It may not be immediately clear why or how monads can be the solution if you don't understand
 *  the mathethical background of them.
 * I don't fully understand it either, but here are some cliff notes.
 * Monads come from a mathematical field of study called Category Theory.
 * Category Theory is the study of abstractions.
 * Lets set that aside and give a more helpful intuition.
 *
 * Here's a brain teaser: how does 1 become 2?
 * You might say "by adding 1 to it: 1 + 1 = 2".
 * This is one of the central theme of Category Theory and software engineering.
 * In order to make useful things happen,
 *  we have to make up objects (1) and then we make up rules on those objects (1 + 1 = 2).
 *
 * A Monad is just the concept that an object and be transformed into another object.
 * It is literally the idea that if that take an (object) number "1"
 *  and you "add" another (object) number to it, "1",
 *  that the resulting (object) number is "2".
 *
 * Hopefully you understand now why Monads are a cool idea for a software engineer,
 *  but if not let me explain by returning to our original problem.
 */

/**
 * Let's say our problem is that we need to write a piece of software
 *  that tells us what recipes we can make from a list of ingredients.
 */

// Types
enum RecipeName {
  RED_PASTA = "red_pasta",
  CHEESE_PASTA = "cheese_pasta",
  BUTTER_PASTA = "butter_pasta",
  PASTA = "pasta",
}

enum Ingredient {
  SALT = "salt",
  BUTTER = "butter",
  WATER = "water",
  FLOUR = "flour",
  EGG = "egg",
  CHEESE = "cheese",
  TOMATO = "tomato",
  PASTA = "pasta",
  NO_PASTA = "no pasta",
}

type Recipe = {
  name: RecipeName;
  // lets not worry about ingredient amounts here
  required: Ingredient[];
  optional: Ingredient[];
  // pretend the cooking steps exists here
};

/**
 * Here are the recipes and their ingredients,
 *  note that one of the ingredients, pasta,
 *  is only avaliable if the ingredients for that are avaliable:
 */
const RECIPES: Record<RecipeName, Recipe> = {
  [RecipeName.RED_PASTA]: {
    name: RecipeName.RED_PASTA,
    required: [Ingredient.PASTA, Ingredient.TOMATO, Ingredient.SALT],
    optional: [Ingredient.BUTTER, Ingredient.CHEESE],
  },
  [RecipeName.CHEESE_PASTA]: {
    name: RecipeName.CHEESE_PASTA,
    required: [Ingredient.PASTA, Ingredient.CHEESE, Ingredient.BUTTER],
    optional: [Ingredient.SALT],
  },
  [RecipeName.BUTTER_PASTA]: {
    name: RecipeName.BUTTER_PASTA,
    required: [Ingredient.BUTTER],
    optional: [Ingredient.PASTA],
  },
  [RecipeName.PASTA]: {
    name: RecipeName.PASTA,
    required: [Ingredient.FLOUR, Ingredient.EGG, Ingredient.WATER],
    optional: [Ingredient.SALT],
  },
};

// And here is an example list of ingredients we have on hand:
const INGREDIENTS: Ingredient[] = [
  Ingredient.SALT,
  Ingredient.BUTTER,
  Ingredient.WATER,
  Ingredient.FLOUR,
  Ingredient.EGG,
  Ingredient.CHEESE,
];

/**
 * Now, you may be tempted to solve this problem with a bunch of If-Thens.
 * But WAIT. Lets think about this for a moment.
 *
 * As we've learned before, a series of If-Then is actually a flowchat which is actually a state machine.
 * A state machine is actually just a graph (or network if you will).
 *
 * So we should represent the Recipes as nodes and the ingredients as links between nodes?
 * NO! Well if you want, but NO! Lets play around with Monads and figure out if they can help us represent
 *  a graph and graph traversal without having to pull out those algorithms.
 *
 * Lets start by thinking about somewhat related but different: Twitter.
 * Twitter is a social network.
 * It has hashtags.
 * Hashtags are a way of linking Tweets together.
 * Tweets are the nodes, Hashtags are the links.
 * Are your neurons firing?
 *
 * Lets represent Recipes as "Hashtags" and Ingredients as "Tweets".
 */

type What_Recipe_Am_I = {
  current_ingredients: Ingredient[];
  possible_recipes: RecipeName[];
};

const WHAT_RECIPE_AM_I: What_Recipe_Am_I = {
  current_ingredients: [],
  possible_recipes: [],
};

// Gather our "Tweets"
WHAT_RECIPE_AM_I.current_ingredients = structuredClone(INGREDIENTS);

/**
 * Try to link our "Tweets" together with "Hashtags"
 *
 * Alternative phrasing, go through our "Hashtags"
 *  and check if any of them can link our "Tweets" together.
 */

/**
 * First, lets check if we can make `pasta`
 *  so we can include it as an ingredient for later checks
 */
if (
  RECIPES[RecipeName.PASTA].required.every((ingredient) =>
    WHAT_RECIPE_AM_I.current_ingredients.includes(ingredient)
  )
) {
  WHAT_RECIPE_AM_I.current_ingredients.push(Ingredient.PASTA);
}

// Then, lets go through the recipes
Object.keys(RECIPES).forEach((recipe) => {
  const recipe_name = recipe as RecipeName;
  if (
    RECIPES[recipe_name].required.every((ingredient) =>
      WHAT_RECIPE_AM_I.current_ingredients.includes(ingredient)
    )
  ) {
    WHAT_RECIPE_AM_I.possible_recipes.push(recipe_name);
  }
});

console.log("\n ORIGINAL: WHAT_RECIPE_AM_I", WHAT_RECIPE_AM_I);

/**
 * So how does a Monad fit into this?
 * Lets start by clearing out the previous results
 */
WHAT_RECIPE_AM_I.possible_recipes = [];

console.log("\n CLEARED: WHAT_RECIPE_AM_I", WHAT_RECIPE_AM_I);

// Then lets create our Monad
function RECIPE_MONAD(what_recipe_am_i: What_Recipe_Am_I, recipe: Recipe) {
  /**
   * First check if we can make `pasta` or not
   *  so we can include it as an ingredient for later checks
   */
  if (
    !what_recipe_am_i.current_ingredients.includes(Ingredient.PASTA) &&
    !what_recipe_am_i.current_ingredients.includes(Ingredient.NO_PASTA)
  ) {
    if (
      RECIPES[RecipeName.PASTA].required.every((ingredient) =>
        what_recipe_am_i.current_ingredients.includes(ingredient)
      )
    ) {
      what_recipe_am_i.current_ingredients.push(Ingredient.PASTA);
    } else {
      what_recipe_am_i.current_ingredients.push(Ingredient.NO_PASTA);
    }
  }

  // Then, lets go through the recipes
  if (
    recipe.required.every((ingredient) =>
      what_recipe_am_i.current_ingredients.includes(ingredient)
    )
  ) {
    what_recipe_am_i.possible_recipes.push(recipe.name);
  }

  return what_recipe_am_i;
}

// Now, lets use it
Object.values(RECIPES).reduce(
  (what_recipe_am_i, recipe) => RECIPE_MONAD(what_recipe_am_i, recipe),
  WHAT_RECIPE_AM_I,
);

console.log("\n MONAD: WHAT_RECIPE_AM_I", WHAT_RECIPE_AM_I);
console.log("\n");

// 🎉 Tada!
// If you are gobsmack, lets talk about it...
