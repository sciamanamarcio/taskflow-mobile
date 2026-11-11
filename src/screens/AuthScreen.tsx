import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../auth/AuthContext";
import { getErrorMessage } from "../lib/api";
import { colors } from "../theme";

export function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isLogin = mode === "login";

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      if (isLogin) await login(email.trim(), password);
      else await register(name.trim(), email.trim(), password);
    } catch (err) {
      setError(getErrorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Text style={styles.brand}>TaskFlow</Text>
        <Text style={styles.heading}>{isLogin ? "Log in" : "Create account"}</Text>

        {!isLogin && (
          <TextInput
            accessibilityLabel="Name"
            placeholder="Name"
            style={styles.input}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
        )}
        <TextInput
          accessibilityLabel="Email"
          placeholder="Email"
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
        />
        <TextInput
          accessibilityLabel="Password"
          placeholder={isLogin ? "Password" : "Password (min. 8 characters)"}
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error ? (
          <Text accessibilityRole="alert" style={styles.error}>
            {error}
          </Text>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isLogin ? "Sign in" : "Create account"}
          disabled={submitting}
          onPress={handleSubmit}
          style={[styles.button, submitting && styles.disabled]}
        >
          {submitting ? (
            <ActivityIndicator color={colors.primaryText} />
          ) : (
            <Text style={styles.buttonText}>{isLogin ? "Sign in" : "Create account"}</Text>
          )}
        </Pressable>

        <View style={styles.switchRow}>
          <Text style={styles.muted}>{isLogin ? "No account yet?" : "Already registered?"}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isLogin ? "Go to create account" : "Go to log in"}
            onPress={() => {
              setMode(isLogin ? "register" : "login");
              setError(null);
            }}
          >
            <Text style={styles.link}>{isLogin ? "Create one" : "Log in"}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flex: 1, justifyContent: "center", padding: 24, gap: 12 },
  brand: { fontSize: 32, fontWeight: "800", color: colors.primary, textAlign: "center" },
  heading: { fontSize: 20, fontWeight: "600", color: colors.text, textAlign: "center", marginBottom: 8 },
  input: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    fontSize: 16,
  },
  error: { color: colors.danger, fontSize: 14 },
  button: { padding: 14, borderRadius: 10, alignItems: "center", backgroundColor: colors.primary },
  buttonText: { color: colors.primaryText, fontSize: 16, fontWeight: "600" },
  disabled: { opacity: 0.6 },
  switchRow: { flexDirection: "row", justifyContent: "center", gap: 6, marginTop: 8 },
  muted: { color: colors.muted },
  link: { color: colors.primary, fontWeight: "600" },
});
