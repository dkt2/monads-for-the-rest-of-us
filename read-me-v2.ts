/**
 * Let's say this is our problem:
 *  - we have a list of recipes
 *  - we have a list of ingredients we have on hand
 *  - we want to find out:
 *      - what recipes we can make the the ingredients we have on hand
 *      - and if that statisfies the preferences of everyone at our party
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
}

type Ingredients = Ingredient[];

type CompositeIngredient = Ingredient | RecipeName;
type CompositeIngredients = CompositeIngredient[];

type Recipe = {
  name: RecipeName;
  ingredients: CompositeIngredients;
  /**
   * TODO: exercises for the reader;
   * - try this problem with optional ingredient
   * - try this problem with ingredient amounts
   * - try this problem with the time it takes to prepare/cook
   * - try this problem with cooking equipment
   * - try this problem with amount of people available to help
   */
};

type Recipes = Record<RecipeName, Recipe>;

type PossibleRecipes = RecipeName[];

type Preference = {
  name: string;
  prefers: RecipeName;
};

type Preferences = Preference[];

// Utilities
function getKeysOfObject<T extends Record<string, unknown>>(obj: T) {
  return Object.keys(obj) as Array<keyof T>;
}

function printResults(
  title: string,
  possibleRecipes: PossibleRecipes,
  unstatisfied: Preferences,
) {
  console.log(`\n--- ${title} ---`);
  console.log("What can we make:", possibleRecipes.sort());
  console.log(
    "People left unstatisfied:",
    unstatisfied.sort((personA, personB) => {
      if (personA.name < personB.name) {
        return -1;
      } else if (personA.name > personB.name) {
        return 1;
      } else {
        return 0;
      }
    }),
  );
  console.log("---------\n");
}

/**
 * Here are the recipes and their ingredients,
 *  note that one of the ingredients, pasta,
 *  is only avaliable if the ingredients for that are avaliable:
 */
const RECIPES: Recipes = {
  [RecipeName.RED_PASTA]: {
    name: RecipeName.RED_PASTA,
    ingredients: [RecipeName.PASTA, Ingredient.TOMATO, Ingredient.SALT],
  },
  [RecipeName.CHEESE_PASTA]: {
    name: RecipeName.CHEESE_PASTA,
    ingredients: [RecipeName.PASTA, Ingredient.CHEESE, Ingredient.BUTTER],
  },
  [RecipeName.BUTTER_PASTA]: {
    name: RecipeName.BUTTER_PASTA,
    ingredients: [Ingredient.BUTTER],
  },
  [RecipeName.PASTA]: {
    name: RecipeName.PASTA,
    ingredients: [Ingredient.FLOUR, Ingredient.EGG, Ingredient.WATER],
  },
};

// And here is an example list of ingredients we have on hand:
const INGREDIENTS: Ingredients = [
  Ingredient.SALT,
  Ingredient.BUTTER,
  Ingredient.WATER,
  Ingredient.FLOUR,
  Ingredient.EGG,
  Ingredient.CHEESE,
];

// And here are the people attending our party and their preferences
const PREFERENCES: Preference[] = [
  { name: "Sally", prefers: RecipeName.CHEESE_PASTA },
  { name: "Boron", prefers: RecipeName.BUTTER_PASTA },
  { name: "Fati", prefers: RecipeName.PASTA },
  { name: "Chang", prefers: RecipeName.RED_PASTA },
  { name: "James", prefers: RecipeName.RED_PASTA },
  { name: "Martin", prefers: RecipeName.RED_PASTA },
];

// A common way to solve this problem is with a bunch of If-Thens
function v1_1(
  recipes: Recipes,
  ingredients: Ingredients,
  preferences: Preferences,
) {
  const _ingredients: CompositeIngredients = structuredClone(ingredients);
  const possibleRecipes: PossibleRecipes = [];
  const unstatisfied: Preferences = [];

  if (
    recipes[RecipeName.PASTA].ingredients.every((ingredient) =>
      _ingredients.includes(ingredient)
    )
  ) {
    _ingredients.push(RecipeName.PASTA);
    possibleRecipes.push(RecipeName.PASTA);
  }

  if (
    recipes[RecipeName.BUTTER_PASTA].ingredients.every((ingredient) =>
      _ingredients.includes(ingredient)
    )
  ) {
    possibleRecipes.push(RecipeName.BUTTER_PASTA);
  }

  if (
    recipes[RecipeName.CHEESE_PASTA].ingredients.every((ingredient) =>
      _ingredients.includes(ingredient)
    )
  ) {
    possibleRecipes.push(RecipeName.CHEESE_PASTA);
  }

  if (
    recipes[RecipeName.RED_PASTA].ingredients.every((ingredient) =>
      _ingredients.includes(ingredient)
    )
  ) {
    possibleRecipes.push(RecipeName.RED_PASTA);
  }

  preferences.forEach((preference) => {
    if (!possibleRecipes.includes(preference.prefers)) {
      unstatisfied.push(preference);
    }
  });

  printResults("v1.1", possibleRecipes, unstatisfied);
}

// Maybe you might clean this up a bit with more loops
function v1_2(
  recipes: Recipes,
  ingredients: Ingredients,
  preferences: Preferences,
) {
  const _ingredients: CompositeIngredients = structuredClone(ingredients);
  const possibleRecipes: PossibleRecipes = [];
  const unstatisfied: Preferences = [];

  if (
    recipes[RecipeName.PASTA].ingredients.every((ingredient) =>
      _ingredients.includes(ingredient)
    )
  ) {
    _ingredients.push(RecipeName.PASTA);
    possibleRecipes.push(RecipeName.PASTA);
  }

  getKeysOfObject(recipes).filter((recipe) => recipe !== RecipeName.PASTA)
    .forEach(
      (recipe) => {
        if (
          recipes[recipe].ingredients.every((ingredient) =>
            _ingredients.includes(ingredient)
          )
        ) {
          possibleRecipes.push(recipe);
        }
      },
    );

  preferences.forEach((preference) => {
    if (!possibleRecipes.includes(preference.prefers)) {
      unstatisfied.push(preference);
    }
  });

  printResults("v1.2", possibleRecipes, unstatisfied);
}

/**
 * So how does Monads fit into this?
 *
 * Often times, we have separte variables that are actually related.
 * For example, `possibleRecipes` and `unstatisfied` are related
 *  because you can't compute `unstatisfied` without `possibleRecipes`.
 *
 * For many programmers unfamiliar with Monads,
 *  they leave this variables separate.
 *
 * But you don't have to!
 */
function v1_1_with_Monads(
  recipes: Recipes,
  ingredients: Ingredients,
  preferences: Preferences,
) {
  const _ingredients: CompositeIngredients = structuredClone(ingredients);

  type MonadContainer = {
    possibleRecipes: PossibleRecipes;
    unstatisfied: Preferences;
  };

  const monad_container: MonadContainer = {
    possibleRecipes: [],
    unstatisfied: [],
  };

  const monad_functor_possibleRecipes =
    (recipes: Recipes) => (container: MonadContainer) => {
      getKeysOfObject(recipes).forEach((recipe) => {
        if (
          recipes[recipe].ingredients.every((ingredient) =>
            _ingredients.includes(ingredient)
          )
        ) {
          container.possibleRecipes.push(recipe);
        }
      });

      return container;
    };

  const monad_functor_unstatisfied =
    (preferences: Preferences) => (container: MonadContainer) => {
      preferences.forEach((preference) => {
        if (!container.possibleRecipes.includes(preference.prefers)) {
          container.unstatisfied.push(preference);
        }
      });

      return container;
    };

  if (
    recipes[RecipeName.PASTA].ingredients.every((ingredient) =>
      _ingredients.includes(ingredient)
    )
  ) {
    _ingredients.push(RecipeName.PASTA);
  }

  /**
   * So what is the point of this?
   *
   * - Its more scalable: if next time you recieve a ticket
   *  to implement `remaining_ingredients_needed_to_statisfy_everyone`,
   *  that is simply another `functor` to implement
   *  while without Monads its another block of code to dump somewhere.
   *
   * - Its more modular and clean: instead of
   *  contiguous blocks of code in the other examples
   *  you can navigate the code more precisely because everything
   *  is broken up into small functions that are composed together.
   *
   * - Its more testable: related to the fact that its more modular,
   *  since everything is broken up into small functions
   *  you can implement unit tests on each of them.
   *  In contrast to the other examples,
   *  it would be a struggle to do so and very messy (without this pattern),
   *  or you'd end up with a unit test that isn't much of a unit
   *  and doesn't tell you as much information when it fails.
   *
   * - Its more readable: there's context in-line
   *  for what each `functor` needs and how it relates to the code around it.
   *  In contrast, the other examples are just blocks of code with no
   *  easy indication of how it all connects together without spending
   *  lots of time reading and constructing a mental model of it.
   *
   * - Its more refactor-able: ref v1_2_with_Monads
   */
  [monad_container]
    .map((container) => monad_functor_possibleRecipes(recipes)(container))
    .map((container) => monad_functor_unstatisfied(preferences)(container));

  printResults(
    "v1.1 with Monads",
    monad_container.possibleRecipes,
    monad_container.unstatisfied,
  );
}

function v1_2_with_Monads(
  recipes: Recipes,
  ingredients: Ingredients,
  preferences: Preferences,
) {
  const _ingredients: CompositeIngredients = structuredClone(ingredients);

  type MonadContainer = {
    possibleRecipes: PossibleRecipes;
    unstatisfied: Preferences;
  };

  const monad_container: MonadContainer = {
    possibleRecipes: [],
    unstatisfied: [],
  };

  const monad_functor_possibleRecipes =
    (recipes: Recipes) => (container: MonadContainer) => {
      getKeysOfObject(recipes).forEach((recipe) => {
        if (
          recipes[recipe].ingredients.every((ingredient) =>
            _ingredients.includes(ingredient)
          )
        ) {
          container.possibleRecipes.push(recipe);
        }
      });

      return container;
    };

  const monad_functor_unstatisfied =
    (preferences: Preferences) => (container: MonadContainer) => {
      preferences.forEach((preference) => {
        if (!container.possibleRecipes.includes(preference.prefers)) {
          container.unstatisfied.push(preference);
        }
      });

      return container;
    };

  /**
   * Having to do the check if we can make `pasta` be separate
   *  is awkward and error prone:
   * - What if someone comes along and moves the code around?
   * - How do they know we need to do the `pasta` check first in order
   *  for the subsequent code to work correctly?
   *
   * Lets fix that!
   */

  // Instead of this:
  //// if (
  ////   recipes[RecipeName.PASTA].required.every((ingredient) =>
  ////     _ingredients.includes(ingredient)
  ////   )
  //// ) {
  ////   _ingredients.push(Ingredient.PASTA);
  //// }

  // Let do this instead:
  const get_composite_ingredients =
    (ingredients: CompositeIngredients) => (container: MonadContainer) => {
      if (
        recipes[RecipeName.PASTA].ingredients.every((ingredient) =>
          ingredients.includes(ingredient)
        )
      ) {
        ingredients.push(RecipeName.PASTA);
      }

      return container;
    };

  [monad_container]
    /**
     * So we can add it here and give a little more context
     *  that we need to check for composite ingredients
     *  before we can do checks for possible recipes
     *  (we can make from the ingredients)
     */
    .map((container) => get_composite_ingredients(_ingredients)(container))
    .map((container) => monad_functor_possibleRecipes(recipes)(container))
    .map((container) => monad_functor_unstatisfied(preferences)(container));

  printResults(
    "v1.2 with Monads",
    monad_container.possibleRecipes,
    monad_container.unstatisfied,
  );
}

v1_1(RECIPES, INGREDIENTS, PREFERENCES);
v1_2(RECIPES, INGREDIENTS, PREFERENCES);
v1_1_with_Monads(RECIPES, INGREDIENTS, PREFERENCES);
v1_2_with_Monads(RECIPES, INGREDIENTS, PREFERENCES);
