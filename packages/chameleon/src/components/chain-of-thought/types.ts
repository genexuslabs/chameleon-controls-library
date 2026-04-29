/**
 * Status indicator for a chain of thought step
 */
export type ChainOfThoughtStepStatus = "complete" | "active" | "pending";

/**
 * Represents a single step in the chain of thought reasoning process
 */
export type ChainOfThoughtStep = {
  /**
   * Unique identifier for the step
   */
  id: string;

  /**
   * The main label/title for the step
   */
  label: string;

  /**
   * Optional detailed description of what this step involves
   */
  description?: string;

  /**
   * Visual icon identifier, data URI, or Lit template for the step
   * Can be a string representing an icon name, data URI, or a Lit html template
   */
  icon?: string | unknown;

  /**
   * Current status of the step (complete, active, or pending)
   */
  status: ChainOfThoughtStepStatus;

  /**
   * Optional search results associated with this specific step
   */
  searchResults?: ChainOfThoughtSearchResult[];

  /**
   * Optional images associated with this specific step
   */
  images?: ChainOfThoughtImage[];
};

/**
 * Represents a search result link displayed in the chain of thought
 */
export type ChainOfThoughtSearchResult = {
  /**
   * Unique identifier for the search result
   */
  id: string;

  /**
   * The URL or text to display for the search result
   */
  url: string;

  /**
   * Optional label/title for the search result
   */
  label?: string;
};

/**
 * Represents an image with caption in the chain of thought
 */
export type ChainOfThoughtImage = {
  /**
   * Unique identifier for the image
   */
  id: string;

  /**
   * Source URL for the image
   */
  src: string;

  /**
   * Optional caption text displayed below the image
   */
  caption?: string;

  /**
   * Alt text for accessibility
   */
  alt: string;
};

/**
 * Event payload emitted when the chain of thought accordion is expanded or collapsed
 */
export type ChainOfThoughtOpenChangeEvent = {
  /**
   * Whether the chain of thought is now open (true) or closed (false)
   */
  open: boolean;
};
