import PokemonDetailView, { type PokemonDisplayData } from '@/components/pokemon/PokemonDetailView';
import { extractPokemonFromImage, validateOCRResult, type OCRResult } from '@/services/ocr';
import { addPokemon, type ScannedPokemon } from '@/services/storage';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ScanResultScreen() {
    const { imageUri } = useLocalSearchParams<{ imageUri: string }>();

    // OCR state
    const [ocrResult, setOcrResult] = useState<OCRResult>({
        name: null,
        cp: null,
        hp: null,
    });
    const [ocrLoading, setOcrLoading] = useState(true);

    // Manual input state
    const [manualName, setManualName] = useState('');
    const [manualCP, setManualCP] = useState('');
    const [manualHP, setManualHP] = useState('');

    // Validation errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Save state
    const [saving, setSaving] = useState(false);

    // Level calc state - DISABLED
    const [calculatedLevel, setCalculatedLevel] = useState<number | null>(null);

    // Update calculated level when OCR result changes
    useEffect(() => {
        if (ocrResult.level) {
            setCalculatedLevel(ocrResult.level);
        }
    }, [ocrResult.level]);

    // Run OCR on mount
    useEffect(() => {
        runOCR();
    }, [imageUri]);

    const runOCR = async () => {
        if (!imageUri) {
            setOcrLoading(false);
            return;
        }

        setOcrLoading(true);
        try {
            const result = await extractPokemonFromImage(imageUri);
            setOcrResult(result);

            // Pre-fill manual inputs with OCR results if available
            if (result.name) setManualName(result.name);
            if (result.cp) setManualCP(result.cp.toString());
            if (result.hp) setManualHP(result.hp.toString());
        } catch (error) {
            // console.error('OCR error:', error);
        } finally {
            setOcrLoading(false);
        }
    };

    const getFinalValues = () => {
        return {
            name: manualName.trim() || ocrResult.name,
            cp: manualCP ? parseInt(manualCP, 10) : ocrResult.cp,
            hp: manualHP ? parseInt(manualHP, 10) : ocrResult.hp,
        };
    };

    // Attempt to recalculate level - DISABLED
    // We strictly use whatever OCR gave us (which is now null for level)
    useEffect(() => {
        // No-op
    }, []);

    // Build display data for preview
    const displayData: PokemonDisplayData = {
        name: getFinalValues().name,
        cp: getFinalValues().cp,
        hp: getFinalValues().hp,
        level: calculatedLevel,
        iv: ocrResult.iv ? {
            atk: ocrResult.iv.atk || 0,
            def: ocrResult.iv.def || 0,
            sta: ocrResult.iv.sta || 0,
            percent: Math.round(((ocrResult.iv.atk || 0) + (ocrResult.iv.def || 0) + (ocrResult.iv.sta || 0)) / 45 * 100)
        } : null,
        imageUri: imageUri || '',
        barPositions: ocrResult.barPositions,
    };

    const handleSave = async () => {
        const finalValues = getFinalValues();

        // Validate
        const validationErrors = validateOCRResult(finalValues);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setSaving(true);
        try {
            // Determine status
            const hasAllOCR = ocrResult.name && ocrResult.cp && ocrResult.hp;
            const status: 'complete' | 'needs_review' = hasAllOCR ? 'complete' : 'needs_review';

            // Create Pokémon with OCR data
            // Create Pokémon with OCR data
            const cleanIVs = ocrResult.iv && typeof ocrResult.iv === 'object' ? {
                atk: ocrResult.iv.atk || 0,
                def: ocrResult.iv.def || 0,
                sta: ocrResult.iv.sta || 0,
                percent: Math.round(((ocrResult.iv.atk || 0) + (ocrResult.iv.def || 0) + (ocrResult.iv.sta || 0)) / 45 * 100)
            } : null;

            console.log('[ScanResult] Saving Pokemon:', {
                name: finalValues.name,
                level: calculatedLevel,
                iv: cleanIVs
            });

            const pokemon: ScannedPokemon = {
                id: Date.now().toString(),
                name: finalValues.name!,
                cp: finalValues.cp,
                hp: finalValues.hp,
                level: calculatedLevel,
                iv: cleanIVs,
                imageUri,
                scannedAt: Date.now(),
                ocr: ocrResult,
                status,
            };

            await addPokemon(pokemon);

            Alert.alert('Success', 'Pokémon saved to My Pokémon!', [
                {
                    text: 'OK',
                    onPress: () => router.push('/pokehub/my-pokemon'),
                },
            ]);
        } catch (error) {
            console.error('Error saving Pokémon:', error);
            Alert.alert('Error', 'Failed to save Pokémon. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleDiscard = () => {
        Alert.alert('Discard Scan?', 'Are you sure you want to discard this scan?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Discard',
                style: 'destructive',
                onPress: () => router.push('/pokehub'),
            },
        ]);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoid}
            >
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>Scan Result</Text>
                        {ocrLoading && <Text style={styles.headerSubtitle}>Analyzing screenshot...</Text>}
                        {!ocrLoading && (!ocrResult.name || !ocrResult.cp || !ocrResult.hp) && (
                            <Text style={styles.headerSubtitle}>Enter missing details below</Text>
                        )}
                        {!ocrLoading && ocrResult.name && !calculatedLevel && (
                            <Text style={[styles.headerSubtitle, { color: '#FF3B30', marginTop: 4 }]}>
                                <Ionicons name="alert-circle" size={14} /> Check name to calculate Level
                            </Text>
                        )}
                    </View>

                    {/* Manual Input Section */}
                    {!ocrLoading && (
                        <View style={styles.manualSection}>
                            {/* Name Input */}
                            {!ocrResult.name && (
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>
                                        <Ionicons name="alert-circle" size={14} color="#FF9800" /> Couldn't detect name
                                        – enter manually
                                    </Text>
                                    <TextInput
                                        value={manualName}
                                        onChangeText={(text) => {
                                            setManualName(text);
                                            if (errors.name) {
                                                const newErrors = { ...errors };
                                                delete newErrors.name;
                                                setErrors(newErrors);
                                            }
                                        }}
                                        placeholder="Enter Pokémon name"
                                        style={[styles.input, errors.name && styles.inputError]}
                                        autoCapitalize="words"
                                    />
                                    {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                                </View>
                            )}

                            {/* CP Input */}
                            {!ocrResult.cp && (
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>
                                        <Ionicons name="alert-circle" size={14} color="#FF9800" /> Couldn't detect CP –
                                        enter manually
                                    </Text>
                                    <TextInput
                                        value={manualCP}
                                        onChangeText={(text) => {
                                            setManualCP(text.replace(/[^0-9]/g, ''));
                                            if (errors.cp) {
                                                const newErrors = { ...errors };
                                                delete newErrors.cp;
                                                setErrors(newErrors);
                                            }
                                        }}
                                        placeholder="Enter CP"
                                        style={[styles.input, errors.cp && styles.inputError]}
                                        keyboardType="number-pad"
                                        maxLength={4}
                                    />
                                    {errors.cp && <Text style={styles.errorText}>{errors.cp}</Text>}
                                </View>
                            )}

                            {/* HP Input */}
                            {!ocrResult.hp && (
                                <View style={styles.inputGroup}>
                                    <Text style={styles.inputLabel}>
                                        <Ionicons name="alert-circle" size={14} color="#FF9800" /> Couldn't detect HP –
                                        enter manually
                                    </Text>
                                    <TextInput
                                        value={manualHP}
                                        onChangeText={(text) => {
                                            setManualHP(text.replace(/[^0-9]/g, ''));
                                            if (errors.hp) {
                                                const newErrors = { ...errors };
                                                delete newErrors.hp;
                                                setErrors(newErrors);
                                            }
                                        }}
                                        placeholder="Enter HP"
                                        style={[styles.input, errors.hp && styles.inputError]}
                                        keyboardType="number-pad"
                                        maxLength={3}
                                    />
                                    {errors.hp && <Text style={styles.errorText}>{errors.hp}</Text>}
                                </View>
                            )}
                        </View>
                    )}

                    {/* Shared Pokemon Detail View */}
                    <PokemonDetailView data={displayData}>
                        {/* Action Buttons */}
                        <View style={styles.buttonsContainer}>
                            <Pressable
                                style={({ pressed }) => [
                                    styles.button,
                                    styles.saveButton,
                                    pressed && styles.buttonPressed,
                                    (saving || ocrLoading) && styles.buttonDisabled,
                                ]}
                                onPress={handleSave}
                                disabled={saving || ocrLoading}
                            >
                                <Ionicons name="save" size={20} color="#fff" />
                                <Text style={styles.saveButtonText}>
                                    {saving ? 'Saving...' : 'Save to My Pokémon'}
                                </Text>
                            </Pressable>

                            <Pressable
                                style={({ pressed }) => [
                                    styles.button,
                                    styles.discardButton,
                                    pressed && styles.buttonPressed,
                                ]}
                                onPress={handleDiscard}
                                disabled={saving}
                            >
                                <Ionicons name="close" size={20} color="#666" />
                                <Text style={styles.discardButtonText}>Discard</Text>
                            </Pressable>
                        </View>
                    </PokemonDetailView>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    keyboardAvoid: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    header: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#000',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 13,
        color: '#999',
        fontStyle: 'italic',
    },
    manualSection: {
        marginHorizontal: 16,
        marginBottom: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 13,
        color: '#FF9800',
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#000',
    },
    inputError: {
        borderColor: '#FF3B30',
    },
    errorText: {
        fontSize: 12,
        color: '#FF3B30',
        marginTop: 4,
    },
    buttonsContainer: {
        gap: 12,
    },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
        borderRadius: 12,
        gap: 8,
    },
    saveButton: {
        backgroundColor: '#007AFF',
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    discardButton: {
        backgroundColor: '#f5f5f5',
    },
    discardButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666',
    },
    buttonPressed: {
        opacity: 0.7,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
});
