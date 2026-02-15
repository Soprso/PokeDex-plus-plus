import type { IconBaseProps } from 'react-icons';
import { IoMdAdd, IoMdArrowBack, IoMdArrowForward, IoMdCamera, IoMdCart, IoMdCheckmark, IoMdClose, IoMdCreate, IoMdDownload, IoMdFingerPrint, IoMdFlash, IoMdFlashOff, IoMdGift, IoMdGlobe, IoMdHeart, IoMdHeartEmpty, IoMdHeartHalf, IoMdHome, IoMdImages, IoMdPerson, IoMdReverseCamera, IoMdRibbon, IoMdRocket, IoMdSearch, IoMdSettings, IoMdShare, IoMdStar, IoMdSwap, IoMdTrash } from "react-icons/io";
import { MdFilterList } from "react-icons/md";


export const Ionicons = (props: { name: string; size?: number; color?: string; style?: any }) => {
    const { name, size = 24, color = 'black', style } = props;
    const iconProps: IconBaseProps = { size, color, style };

    // Map Ionicons names to React Icons (IoMd*)
    // This is a manual mapping based on usage. 
    // Add more as discovered.
    switch (name) {
        case 'home': return <IoMdHome {...iconProps} />;
        case 'home-outline': return <IoMdHome {...iconProps} />;
        case 'settings': return <IoMdSettings {...iconProps} />;
        case 'settings-outline': return <IoMdSettings {...iconProps} />;
        case 'person': return <IoMdPerson {...iconProps} />;
        case 'person-outline': return <IoMdPerson {...iconProps} />;
        case 'cart': return <IoMdCart {...iconProps} />;
        case 'cart-outline': return <IoMdCart {...iconProps} />;
        case 'search': return <IoMdSearch {...iconProps} />;
        case 'arrow-back': return <IoMdArrowBack {...iconProps} />;
        case 'close': return <IoMdClose {...iconProps} />;
        case 'checkmark': return <IoMdCheckmark {...iconProps} />;
        case 'checkmark-circle': return <IoMdCheckmark {...iconProps} />;
        case 'add': return <IoMdAdd {...iconProps} />;
        case 'trash': return <IoMdTrash {...iconProps} />;
        case 'create': return <IoMdCreate {...iconProps} />;
        case 'share': return <IoMdShare {...iconProps} />;
        case 'share-outline': return <IoMdShare {...iconProps} />;
        case 'download': return <IoMdDownload {...iconProps} />;
        case 'images': return <IoMdImages {...iconProps} />;
        case 'camera': return <IoMdCamera {...iconProps} />;
        case 'flash': return <IoMdFlash {...iconProps} />;
        case 'flash-off': return <IoMdFlashOff {...iconProps} />;
        case 'camera-reverse': return <IoMdReverseCamera {...iconProps} />;
        case 'heart': return <IoMdHeart {...iconProps} />;
        case 'heart-outline': return <IoMdHeartEmpty {...iconProps} />;
        case 'heart-half': return <IoMdHeartHalf {...iconProps} />;
        case 'star': return <IoMdStar {...iconProps} />;
        case 'finger-print': return <IoMdFingerPrint {...iconProps} />;
        case 'gift': return <IoMdGift {...iconProps} />;
        case 'rocket': return <IoMdRocket {...iconProps} />;
        case 'arrow-forward': return <IoMdArrowForward {...iconProps} />;
        case 'ribbon': return <IoMdRibbon {...iconProps} />;
        case 'filter': return <MdFilterList {...iconProps} />;
        case 'planet': return <IoMdGlobe {...iconProps} />;
        case 'swap-vertical': return <IoMdSwap {...iconProps} />;
        case 'alert-circle': return <span style={{ color, fontSize: size }}>!</span>;
        default: return null;
    }
};

// Mock glyphMap for type compatibility
Ionicons.glyphMap = {
    'home': 'home',
    'settings': 'settings',
    'person': 'person',
    'cart': 'cart',
    // Add others as needed to satisfy strict keyof checks if used elsewhere
} as const;
