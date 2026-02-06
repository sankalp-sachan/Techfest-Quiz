import React from 'react';
import { motion } from 'framer-motion';

const Loader = ({ text = "Loading..." }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] w-full">
            <div className="relative flex items-center justify-center mb-8">
                {/* Outer Glow */}
                <motion.div
                    className="absolute inset-0 rounded-full blur-xl bg-primary-500/30"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3]
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                {/* Outer Ring */}
                <motion.div
                    className="relative w-24 h-24 rounded-full border-4 border-transparent border-t-primary-500 border-r-primary-400"
                    animate={{ rotate: 360 }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />

                {/* Middle Ring */}
                <motion.div
                    className="absolute w-16 h-16 rounded-full border-4 border-transparent border-b-purple-500 border-l-purple-400"
                    animate={{ rotate: -360 }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                />

                {/* Inner Core */}
                <motion.div
                    className="absolute w-4 h-4 rounded-full bg-gradient-to-tr from-primary-400 to-purple-500 shadow-[0_0_15px_rgba(99,102,241,0.6)]"
                    animate={{
                        scale: [1, 1.5, 1],
                    }}
                    transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            </div>

            {/* Text with shine effect */}
            <div className="relative overflow-hidden">
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 via-purple-500 to-primary-500 font-poppins tracking-widest uppercase"
                >
                    {text}
                </motion.p>
                <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent skew-x-12"
                    animate={{ x: ['-150%', '150%'] }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        repeatDelay: 0.5,
                        ease: "easeInOut"
                    }}
                />
            </div>

            {/* Loading dots */}
            <div className="flex gap-1 mt-2">
                {[0, 1, 2].map((i) => (
                    <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-slate-400 dark:bg-slate-600"
                        animate={{
                            y: [0, -4, 0],
                            opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            delay: i * 0.1,
                            ease: "easeInOut"
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default Loader;
