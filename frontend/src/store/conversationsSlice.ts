import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { api } from "../lib/api";

export type Conversation = {
  _id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
};

type ConversationsState = {
  items: Conversation[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
};

const initialState: ConversationsState = {
  items: [],
  status: "idle",
  error: null,
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? fallback;
  }
  return fallback;
};

export const fetchConversations = createAsyncThunk<
  Conversation[],
  void,
  { rejectValue: string }
>("conversations/fetch", async (_, { rejectWithValue }) => {
  try {
    const response = await api.get<Conversation[]>("/chat");
    return response.data;
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, "Unable to load your conversations."),
    );
  }
});

export const createConversation = createAsyncThunk<
  Conversation,
  string,
  { rejectValue: string }
>("conversations/create", async (message, { rejectWithValue }) => {
  try {
    const response = await api.post<Conversation>("/chat", { message });
    return response.data;
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, "Unable to start a new conversation."),
    );
  }
});

const conversationsSlice = createSlice({
  name: "conversations",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        const fetchedIds = new Set(action.payload.map((chat) => chat._id));
        state.items = [
          ...action.payload,
          ...state.items.filter((chat) => !fetchedIds.has(chat._id)),
        ];
        state.status = "succeeded";
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          action.payload ?? "Unable to load your conversations.";
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.items = [
          action.payload,
          ...state.items.filter((chat) => chat._id !== action.payload._id),
        ];
      });
  },
});

export default conversationsSlice.reducer;
